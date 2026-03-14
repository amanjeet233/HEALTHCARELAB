package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.BookedSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface BookedSlotRepository extends JpaRepository<BookedSlot, Long> {

    long countBySlotConfigIdAndSlotDate(Long slotConfigId, LocalDate slotDate);

    Optional<BookedSlot> findByBookingId(Long bookingId);

    void deleteByBookingId(Long bookingId);
}
