package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.dto.BookingRequest;
import com.healthcare.labtestbooking.dto.BookingResponse;
import com.healthcare.labtestbooking.entity.Booking;
import com.healthcare.labtestbooking.entity.LabTest;
import com.healthcare.labtestbooking.entity.User;
import com.healthcare.labtestbooking.entity.enums.BookingStatus;
import com.healthcare.labtestbooking.entity.enums.CollectionType;
import com.healthcare.labtestbooking.entity.enums.UserRole;
import com.healthcare.labtestbooking.repository.BookingRepository;
import com.healthcare.labtestbooking.repository.LabTestRepository;
import com.healthcare.labtestbooking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final LabTestRepository labTestRepository;

    private static final BigDecimal HOME_COLLECTION_CHARGE = new BigDecimal("150.00");

    @Transactional
    public BookingResponse createBooking(BookingRequest request) {
        log.info("========== CREATE BOOKING ATTEMPT ==========");
        log.info("Request: {}", request);

        User patient = getCurrentUser();
        log.info("Patient: {} (ID: {})", patient.getEmail(), patient.getId());

        // Get testId from request (accepts labTestId in JSON due to @JsonProperty)
        Long testId = request.getTestId();
        if (testId == null) {
            log.error("Test ID is null in request");
            throw new RuntimeException("Test ID is required");
        }
        log.info("Looking up test with ID: {}", testId);

        LabTest labTest = labTestRepository.findById(testId)
                .orElseThrow(() -> new RuntimeException("Lab test not found with id: " + testId));
        log.info("Found test: {} (Price: {})", labTest.getTestName(), labTest.getPrice());

        if (!labTest.getIsActive()) {
            log.error("Test is not active: {}", labTest.getTestName());
            throw new RuntimeException("Lab test is currently not available");
        }

        CollectionType collectionType = CollectionType.LAB;
        BigDecimal homeCharge = BigDecimal.ZERO;

        if (request.getCollectionType() != null && request.getCollectionType().equalsIgnoreCase("HOME")) {
            collectionType = CollectionType.HOME;
            homeCharge = HOME_COLLECTION_CHARGE;
        }

        BigDecimal totalAmount = labTest.getPrice().add(homeCharge);
        BigDecimal discount = request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO;
        BigDecimal finalAmount = totalAmount.subtract(discount);

        String bookingRef = "BK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Booking booking = Booking.builder()
                .bookingReference(bookingRef)
                .patient(patient)
                .test(labTest)
                .bookingDate(request.getBookingDate())
                .timeSlot(request.getTimeSlot())
                .status(BookingStatus.BOOKED)
                .collectionType(collectionType)
                .collectionAddress(request.getCollectionAddress())
                .homeCollectionCharge(homeCharge)
                .totalAmount(totalAmount)
                .discount(discount)
                .finalAmount(finalAmount)
                .build();

        booking = bookingRepository.save(booking);
        return mapToResponse(booking);
    }

    public List<BookingResponse> getMyBookings() {
        User user = getCurrentUser();
        return bookingRepository.findByPatientId(user.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public Page<BookingResponse> getMyBookings(Pageable pageable) {
        User user = getCurrentUser();
        log.info("Fetching bookings for patient {} with pagination | Page: {}, Size: {}",
                user.getId(), pageable.getPageNumber(), pageable.getPageSize());
        return bookingRepository.findByPatientId(user.getId(), pageable)
                .map(this::mapToResponse);
    }

    public List<BookingResponse> getTechnicianBookings() {
        User technician = getCurrentUser();
        return bookingRepository.findByTechnicianId(technician.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public Page<BookingResponse> getTechnicianBookings(Pageable pageable) {
        User technician = getCurrentUser();
        log.info("Fetching bookings for technician {} with pagination | Page: {}, Size: {}",
                technician.getId(), pageable.getPageNumber(), pageable.getPageSize());
        return bookingRepository.findByTechnicianId(technician.getId(), pageable)
                .map(this::mapToResponse);
    }

    public List<String> getAvailableSlots(String dateStr, Long testId) {
        LocalDate date = LocalDate.parse(dateStr);
        List<Booking> bookings = bookingRepository.findByBookingDate(date);

        // Define available time slots
        List<String> allSlots = java.util.Arrays.asList(
                "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
                "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM");

        Set<String> bookedSlots = bookings.stream()
                .map(Booking::getTimeSlot)
                .collect(Collectors.toSet());

        return allSlots.stream()
                .filter(slot -> !bookedSlots.contains(slot))
                .collect(Collectors.toList());
    }

    public BookingResponse getBookingById(Long id) {
        User user = getCurrentUser();
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));

        if (!booking.getPatient().getId().equals(user.getId())
                && user.getRole() != UserRole.ADMIN) {
            throw new RuntimeException("You don't have permission to view this booking");
        }

        return mapToResponse(booking);
    }

    @Transactional
    public BookingResponse cancelBooking(Long id) {
        User user = getCurrentUser();
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));

        if (!booking.getPatient().getId().equals(user.getId())
                && user.getRole() != UserRole.ADMIN) {
            throw new RuntimeException("You don't have permission to cancel this booking");
        }

        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new RuntimeException("Cannot cancel a completed booking");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking = bookingRepository.save(booking);
        return mapToResponse(booking);
    }

    public List<BookingResponse> getBookingsByTechnician(Long technicianId) {
        return bookingRepository.findByTechnicianId(technicianId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<Booking> getTechnicianBookings(Long technicianId){
        return bookingRepository.findByTechnicianId(technicianId);
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public BookingResponse assignTechnician(Long bookingId, Long technicianId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));

        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new RuntimeException("Technician not found with id: " + technicianId));

        if (technician.getRole() != UserRole.TECHNICIAN) {
            throw new RuntimeException("User is not a technician");
        }

        booking.setTechnician(technician);
        booking = bookingRepository.save(booking);
        return mapToResponse(booking);
    }

    public boolean checkSlotAvailability(LocalDate date, String timeSlot) {
        List<Booking> existingBookings = bookingRepository.findByBookingDateAndTimeSlot(date, timeSlot);
        return existingBookings.isEmpty();
    }

    @Transactional
    public BookingResponse updateBookingStatus(Long id, String status) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));
        booking.setStatus(BookingStatus.valueOf(status.toUpperCase()));
        booking = bookingRepository.save(booking);
        return mapToResponse(booking);
    }

    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public Page<BookingResponse> getAllBookings(Pageable pageable) {
        log.info("Fetching all bookings with pagination | Page: {}, Size: {}",
                pageable.getPageNumber(), pageable.getPageSize());
        return bookingRepository.findAll(pageable)
                .map(this::mapToResponse);
    }

    public List<BookingResponse> getUpcomingBookings() {
        User user = getCurrentUser();
        return bookingRepository.findByPatientIdAndStatus(user.getId(), BookingStatus.BOOKED).stream()
                .filter(b -> !b.getBookingDate().isBefore(LocalDate.now()))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getBookingHistory() {
        User user = getCurrentUser();
        List<BookingStatus> historyStatuses = Arrays.asList(
                BookingStatus.COMPLETED, BookingStatus.CANCELLED);
        return bookingRepository.findByPatientId(user.getId()).stream()
                .filter(b -> historyStatuses.contains(b.getStatus()) || b.getBookingDate().isBefore(LocalDate.now()))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public BookingResponse rescheduleBooking(Long bookingId, LocalDate newDate, String newTimeSlot) {
        User user = getCurrentUser();
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));

        if (!booking.getPatient().getId().equals(user.getId()) && user.getRole() != UserRole.ADMIN) {
            throw new RuntimeException("You don't have permission to reschedule this booking");
        }
        if (booking.getStatus() != BookingStatus.BOOKED) {
            throw new RuntimeException("Can only reschedule bookings in BOOKED status");
        }
        if (newDate.isBefore(LocalDate.now())) {
            throw new RuntimeException("Cannot reschedule to a past date");
        }

        booking.setBookingDate(newDate);
        booking.setTimeSlot(newTimeSlot);
        booking = bookingRepository.save(booking);
        log.info("Booking {} rescheduled to {} at {}", bookingId, newDate, newTimeSlot);
        return mapToResponse(booking);
    }

    private User getCurrentUser() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private BookingResponse mapToResponse(Booking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .bookingReference(booking.getBookingReference())
                .patientId(booking.getPatient().getId())
                .patientName(booking.getPatient().getName())
                .labTestId(booking.getTest().getId())
                .labTestName(booking.getTest().getTestName())
                .bookingDate(booking.getBookingDate())
                .timeSlot(booking.getTimeSlot())
                .status(booking.getStatus().name())
                .collectionType(booking.getCollectionType().name())
                .collectionAddress(booking.getCollectionAddress())
                .homeCollectionCharge(booking.getHomeCollectionCharge())
                .totalAmount(booking.getTotalAmount())
                .discount(booking.getDiscount())
                .finalAmount(booking.getFinalAmount())
                .paymentStatus(booking.getPaymentStatus() != null ? booking.getPaymentStatus().name() : "PENDING")
                .createdAt(booking.getCreatedAt())
                .build();
    }
}
