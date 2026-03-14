package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.BookedSlot;
import com.healthcare.labtestbooking.repository.BookedSlotRepository;
import com.healthcare.labtestbooking.dto.BookedSlotRequest;
import com.healthcare.labtestbooking.dto.BookedSlotResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookedSlotService {

    private final BookedSlotRepository repository;

    @Transactional(readOnly = true)
    public List<BookedSlotResponse> getAll() {
        return repository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BookedSlotResponse getById(Long id) {
        BookedSlot entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("BookedSlot not found with id " + id));
        return mapToResponse(entity);
    }

    @Transactional
    public BookedSlotResponse create(BookedSlotRequest request) {
        BookedSlot entity = new BookedSlot();
        // map request to entity here
        BookedSlot saved = repository.save(entity);
        return mapToResponse(saved);
    }

    @Transactional
    public BookedSlotResponse update(Long id, BookedSlotRequest request) {
        BookedSlot entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("BookedSlot not found with id " + id));
        // update entity from request here
        BookedSlot updated = repository.save(entity);
        return mapToResponse(updated);
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }

    private BookedSlotResponse mapToResponse(BookedSlot entity) {
        BookedSlotResponse response = new BookedSlotResponse();
        // Assume Long id field for boilerplate
        try {
            response.setId(entity.getId());
        } catch(Exception e) {
            // Ignore if no getId() exists
        }
        return response;
    }
}
