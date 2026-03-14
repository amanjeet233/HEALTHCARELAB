package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.Booking;
import com.healthcare.labtestbooking.entity.Technician;
import com.healthcare.labtestbooking.repository.BookingRepository;
import com.healthcare.labtestbooking.repository.TechnicianRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class TechnicianAssignmentService {

    private static final int EARTH_RADIUS_KM = 6371;

    private final TechnicianRepository technicianRepository;
    private final BookingRepository bookingRepository;

    public List<Technician> findAvailableTechnicians(String pincode, LocalDate date, String slot) {
        if (pincode == null || date == null || slot == null) {
            return List.of();
        }

        SlotWindow slotWindow = parseSlot(slot);
        if (slotWindow == null) {
            return List.of();
        }

        List<Technician> technicians = technicianRepository
            .findDistinctByIsActiveTrueAndServicePincodesContaining(pincode);

        List<Technician> available = new ArrayList<>();
        for (Technician tech : technicians) {
            if (!isWithinWorkingHours(tech, slotWindow)) {
                continue;
            }
            long booked = bookingRepository.countByTechnicianIdAndBookingDateAndTimeSlot(
                tech.getUser().getId(), date, normalizeSlot(slotWindow));
            if (booked == 0) {
                available.add(tech);
            }
        }

        return available;
    }

    @Transactional
    public Technician assignTechnician(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingId));

        String pincode = extractPincode(booking.getCollectionAddress());
        if (pincode == null) {
            throw new RuntimeException("Missing pincode for booking address");
        }
        LocalDate date = booking.getBookingDate();
        String slot = booking.getTimeSlot();
        if (slot == null) {
            throw new RuntimeException("Booking slot is required for assignment");
        }

        List<Technician> candidates = findAvailableTechnicians(pincode, date, slot);
        if (candidates.isEmpty()) {
            throw new RuntimeException("No available technicians for slot");
        }

        SlotWindow slotWindow = parseSlot(slot);
        candidates.sort(Comparator
            .comparingDouble((Technician tech) -> distanceScore(tech, booking))
            .thenComparingLong(tech -> bookingRepository.countByTechnicianIdAndBookingDate(
                tech.getUser().getId(), date))
        );

        Technician assigned = candidates.get(0);
        booking.setTechnician(assigned.getUser());
        booking.setTimeSlot(normalizeSlot(slotWindow));
        bookingRepository.save(booking);

        log.info("Assigned technician {} to booking {}", assigned.getId(), bookingId);
        return assigned;
    }

    @Transactional
    public Technician reassignTechnician(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingId));

        booking.setTechnician(null);
        bookingRepository.save(booking);

        Technician reassigned = assignTechnician(bookingId);
        log.info("Reassigned technician {} to booking {}", reassigned.getId(), bookingId);
        return reassigned;
    }

    public Optional<Technician> getTechnicianLocation(Long technicianId) {
        return technicianRepository.findById(technicianId);
    }

    private boolean isWithinWorkingHours(Technician tech, SlotWindow slot) {
        LocalTime start = tech.getWorkingStart();
        LocalTime end = tech.getWorkingEnd();
        if (start == null || end == null) {
            return true;
        }
        return !slot.start.isBefore(start) && !slot.end.isAfter(end);
    }

    private double distanceScore(Technician tech, Booking booking) {
        if (tech.getCurrentLat() == null || tech.getCurrentLng() == null) {
            return Double.MAX_VALUE;
        }
        GeoPoint userPoint = resolveBookingLocation(booking);
        if (userPoint == null) {
            return Double.MAX_VALUE;
        }
        return haversine(
            tech.getCurrentLat().doubleValue(),
            tech.getCurrentLng().doubleValue(),
            userPoint.lat,
            userPoint.lng
        );
    }

    private GeoPoint resolveBookingLocation(Booking booking) {
        String pincode = extractPincode(booking.getCollectionAddress());
        if (pincode == null) {
            return null;
        }
        return lookupPincodeLocation(pincode);
    }

    private GeoPoint lookupPincodeLocation(String pincode) {
        if (pincode.equals("110001")) {
            return new GeoPoint(28.6328, 77.2197);
        }
        if (pincode.equals("400001")) {
            return new GeoPoint(18.9402, 72.8347);
        }
        if (pincode.equals("560001")) {
            return new GeoPoint(12.9766, 77.5993);
        }
        return null;
    }

    private double haversine(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
            + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
            * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_KM * c;
    }

    private SlotWindow parseSlot(String slot) {
        String normalized = slot.trim().toUpperCase(Locale.ROOT);
        if (!normalized.contains("-")) {
            return null;
        }
        String[] parts = normalized.split("-");
        if (parts.length != 2) {
            return null;
        }
        LocalTime start = parseTime(parts[0]);
        LocalTime end = parseTime(parts[1]);
        if (start == null || end == null) {
            return null;
        }
        return new SlotWindow(start, end);
    }

    private LocalTime parseTime(String token) {
        String value = token.trim().toUpperCase(Locale.ROOT);
        try {
            if (value.endsWith("AM") || value.endsWith("PM")) {
                return parseAmPm(value);
            }
            return LocalTime.parse(value);
        } catch (Exception ex) {
            return null;
        }
    }

    private LocalTime parseAmPm(String value) {
        String trimmed = value.replace(" ", "");
        boolean isPm = trimmed.endsWith("PM");
        String number = trimmed.substring(0, trimmed.length() - 2);
        int hour = Integer.parseInt(number);
        if (hour == 12) {
            hour = 0;
        }
        if (isPm) {
            hour += 12;
        }
        return LocalTime.of(hour, 0);
    }

    private String normalizeSlot(SlotWindow slotWindow) {
        return slotWindow.start + "-" + slotWindow.end;
    }

    private String extractPincode(String address) {
        if (address == null) {
            return null;
        }
        String digits = address.replaceAll("[^0-9]", " ");
        String[] tokens = digits.trim().split("\\s+");
        for (String token : tokens) {
            if (token.length() == 6) {
                return token;
            }
        }
        return null;
    }

    private static class SlotWindow {
        private final LocalTime start;
        private final LocalTime end;

        private SlotWindow(LocalTime start, LocalTime end) {
            this.start = start;
            this.end = end;
        }
    }

    private static class GeoPoint {
        private final double lat;
        private final double lng;

        private GeoPoint(double lat, double lng) {
            this.lat = lat;
            this.lng = lng;
        }
    }
}
