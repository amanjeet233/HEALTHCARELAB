package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.Booking;
import com.healthcare.labtestbooking.entity.enums.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    Optional<Booking> findByBookingReference(String bookingReference);

    List<Booking> findByPatientId(Long patientId);

    Page<Booking> findByPatientId(Long patientId, Pageable pageable);

    List<Booking> findByTestId(Long testId);

    List<Booking> findByStatus(BookingStatus status);

    List<Booking> findByPatientIdAndStatus(Long patientId, BookingStatus status);

    List<Booking> findByBookingDate(LocalDate bookingDate);

    List<Booking> findByBookingDateBetween(LocalDate startDate, LocalDate endDate);

    List<Booking> findByTechnicianId(Long technicianId);

    Page<Booking> findByTechnicianId(Long technicianId, Pageable pageable);

    List<Booking> findByMedicalOfficerId(Long medicalOfficerId);

    List<Booking> findByBookingDateAndTimeSlot(LocalDate bookingDate, String timeSlot);

    long countByBookingDateBetween(LocalDate startDate, LocalDate endDate);

    long countByStatusAndBookingDateBetween(BookingStatus status, LocalDate startDate, LocalDate endDate);

    long countByStatus(BookingStatus status);

    long countByTestId(Long testId);

    long countByTestPackageId(Long testPackageId);

    long countByTechnicianIdAndBookingDateAndTimeSlot(Long technicianId, LocalDate bookingDate, String timeSlot);

    long countByTechnicianIdAndBookingDate(Long technicianId, LocalDate bookingDate);

    @Query("select b.bookingDate, count(b) from Booking b where b.bookingDate between :start and :end group by b.bookingDate order by b.bookingDate")
    List<Object[]> countBookingsByDateRange(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("select b.test.testName, count(b) from Booking b where b.test is not null group by b.test.testName order by count(b) desc")
    List<Object[]> findTopBookedTests(Pageable pageable);
}
