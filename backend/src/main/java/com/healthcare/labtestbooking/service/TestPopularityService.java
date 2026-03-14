package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.TestPopularity;
import com.healthcare.labtestbooking.repository.TestPopularityRepository;
import com.healthcare.labtestbooking.dto.TestPopularityRequest;
import com.healthcare.labtestbooking.dto.TestPopularityResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TestPopularityService {

    private final TestPopularityRepository repository;

    @Transactional(readOnly = true)
    public List<TestPopularityResponse> getAll() {
        return repository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TestPopularityResponse getById(Long id) {
        TestPopularity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("TestPopularity not found with id " + id));
        return mapToResponse(entity);
    }

    @Transactional
    public TestPopularityResponse create(TestPopularityRequest request) {
        TestPopularity entity = new TestPopularity();
        // map request to entity here
        TestPopularity saved = repository.save(entity);
        return mapToResponse(saved);
    }

    @Transactional
    public TestPopularityResponse update(Long id, TestPopularityRequest request) {
        TestPopularity entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("TestPopularity not found with id " + id));
        // update entity from request here
        TestPopularity updated = repository.save(entity);
        return mapToResponse(updated);
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }

    private TestPopularityResponse mapToResponse(TestPopularity entity) {
        TestPopularityResponse response = new TestPopularityResponse();
        // Assume Long id field for boilerplate
        try {
            response.setId(entity.getId());
        } catch(Exception e) {
            // Ignore if no getId() exists
        }
        return response;
    }
}
