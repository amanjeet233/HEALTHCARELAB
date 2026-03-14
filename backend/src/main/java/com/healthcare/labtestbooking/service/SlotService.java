package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.BookedSlot;
import com.healthcare.labtestbooking.entity.Booking;
import com.healthcare.labtestbooking.entity.SlotConfig;
import com.healthcare.labtestbooking.repository.BookedSlotRepository;
import com.healthcare.labtestbooking.repository.BookingRepository;
import com.healthcare.labtestbooking.repository.SlotConfigRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class SlotService {

    private final SlotConfigRepository slotConfigRepository;
    private final BookedSlotRepository bookedSlotRepository;
    private final BookingRepository bookingRepository;

    private final Set<LocalDate> publicHolidays = new HashSet<>();

    public List<SlotConfig> getAvailableSlots(String pincode, LocalDate date) {
        if (pincode == null || date == null) {
            return Collections.emptyList();
        }
        DayOfWeek dayOfWeek = resolveDayType(date);
        List<SlotConfig> configs = slotConfigRepository
            .findByPincodeAndDayOfWeekAndIsActiveTrueOrderBySlotStart(pincode, dayOfWeek);

        List<SlotConfig> available = new ArrayList<>();
        for (SlotConfig config : configs) {
            long booked = bookedSlotRepository.countBySlotConfigIdAndSlotDate(config.getId(), date);
            if (config.getCapacity() != null && booked < config.getCapacity()) {
                available.add(config);
            }
        }
        return available;
    }

    public boolean isSlotAvailable(String pincode, LocalDate date, String slotTime) {
        if (pincode == null || date == null || slotTime == null) {
            return false;
        }
        Optional<SlotConfig> config = findSlotConfig(pincode, date, slotTime);
        if (config.isEmpty()) {
            return false;
        }
        long booked = bookedSlotRepository.countBySlotConfigIdAndSlotDate(config.get().getId(), date);
        return config.get().getCapacity() != null && booked < config.get().getCapacity();
    }

    @Transactional
    public BookedSlot bookSlot(Long bookingId, Long slotId) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingId));
        SlotConfig slotConfig = slotConfigRepository.findById(slotId)
            .orElseThrow(() -> new RuntimeException("Slot not found: " + slotId));

        LocalDate slotDate = booking.getBookingDate() != null ? booking.getBookingDate() : LocalDate.now();
        if (!isSlotAvailable(slotConfig.getPincode(), slotDate, formatSlot(slotConfig))) {
            throw new RuntimeException("Slot not available");
        }

        bookedSlotRepository.findByBookingId(bookingId).ifPresent(existing -> {
            throw new RuntimeException("Slot already booked for this booking");
        });

        booking.setTimeSlot(formatSlot(slotConfig));
        bookingRepository.save(booking);

        BookedSlot bookedSlot = BookedSlot.builder()
            .booking(booking)
            .slotConfig(slotConfig)
            .slotDate(slotDate)
            .build();

        return bookedSlotRepository.save(bookedSlot);
    }

    @Transactional
    public void releaseSlot(Long bookingId) {
        bookedSlotRepository.deleteByBookingId(bookingId);
        bookingRepository.findById(bookingId).ifPresent(booking -> {
            booking.setTimeSlot(null);
            bookingRepository.save(booking);
        });
    }

    private Optional<SlotConfig> findSlotConfig(String pincode, LocalDate date, String slotTime) {
        SlotTime parsed = parseSlotTime(slotTime);
        if (parsed == null) {
            return Optional.empty();
        }
        DayOfWeek dayOfWeek = resolveDayType(date);
        List<SlotConfig> configs = slotConfigRepository
            .findByPincodeAndDayOfWeekAndIsActiveTrueOrderBySlotStart(pincode, dayOfWeek);

        return configs.stream()
            .filter(config -> config.getSlotStart().equals(parsed.start) && config.getSlotEnd().equals(parsed.end))
            .findFirst();
    }

    private DayOfWeek resolveDayType(LocalDate date) {
        if (publicHolidays.contains(date)) {
            return DayOfWeek.SUNDAY;
        }
        return date.getDayOfWeek();
    }

    private SlotTime parseSlotTime(String slotTime) {
        String normalized = slotTime.trim().toUpperCase(Locale.ROOT);
        if (!normalized.contains("-")) {
            return null;
        }
        String[] parts = normalized.split("-");
        if (parts.length != 2) {
            return null;
        }
        try {
            LocalTime start = LocalTime.parse(parts[0].trim());
            LocalTime end = LocalTime.parse(parts[1].trim());
            return new SlotTime(start, end);
        } catch (Exception ex) {
            return null;
        }
    }

    private String formatSlot(SlotConfig config) {
        return config.getSlotStart() + "-" + config.getSlotEnd();
    }

    private static class SlotTime {
        private final LocalTime start;
        private final LocalTime end;

        private SlotTime(LocalTime start, LocalTime end) {
            this.start = start;
            this.end = end;
        }
    }
}
