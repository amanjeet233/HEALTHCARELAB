package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.BookedSlot;
import com.healthcare.labtestbooking.repository.BookedSlotRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class BookedSlotService {

    private final BookedSlotRepository bookedSlotRepository;

    @Transactional
    public BookedSlot createBookedSlot(BookedSlot bookedSlot) {
        log.info("Creating booked slot for date: {}", bookedSlot.getSlotDate());
        return bookedSlotRepository.save(bookedSlot);
    }

    public List<BookedSlot> getBookedSlotsForDate(LocalDate date) {
        return bookedSlotRepository.findBySlotDate(date);
    }

    public Optional<BookedSlot> getBookedSlot(LocalDate date, String timeSlot) {
        return bookedSlotRepository.findBySlotDate(date).stream().findFirst();
    }

    @Transactional
    public void releaseSlot(Long id) {
        log.info("Releasing booked slot with id: {}", id);
        bookedSlotRepository.deleteById(id);
    }
}
