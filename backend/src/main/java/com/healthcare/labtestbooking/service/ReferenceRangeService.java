package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.ReferenceRange;
import com.healthcare.labtestbooking.repository.ReferenceRangeRepository;
import com.healthcare.labtestbooking.dto.ReferenceRangeRequest;
import com.healthcare.labtestbooking.dto.ReferenceRangeResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReferenceRangeService {

    private final ReferenceRangeRepository repository;

    @Transactional(readOnly = true)
    public List<ReferenceRangeResponse> getAll() {
        return repository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ReferenceRangeResponse getById(Long id) {
        ReferenceRange entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("ReferenceRange not found with id " + id));
        return mapToResponse(entity);
    }

    @Transactional
    public ReferenceRangeResponse create(ReferenceRangeRequest request) {
        ReferenceRange entity = new ReferenceRange();
        // map request to entity here
        ReferenceRange saved = repository.save(entity);
        return mapToResponse(saved);
    }

    @Transactional
    public ReferenceRangeResponse update(Long id, ReferenceRangeRequest request) {
        ReferenceRange entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("ReferenceRange not found with id " + id));
        // update entity from request here
        ReferenceRange updated = repository.save(entity);
        return mapToResponse(updated);
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }

    private ReferenceRangeResponse mapToResponse(ReferenceRange entity) {
        ReferenceRangeResponse response = new ReferenceRangeResponse();
        // Assume Long id field for boilerplate
        try {
            response.setId(entity.getId());
        } catch(Exception e) {
            // Ignore if no getId() exists
        }
        return response;
    }
}
