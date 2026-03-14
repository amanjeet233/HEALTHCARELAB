package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.TestParameter;
import com.healthcare.labtestbooking.repository.TestParameterRepository;
import com.healthcare.labtestbooking.dto.TestParameterRequest;
import com.healthcare.labtestbooking.dto.TestParameterResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TestParameterService {

    private final TestParameterRepository repository;

    @Transactional(readOnly = true)
    public List<TestParameterResponse> getAll() {
        return repository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TestParameterResponse getById(Long id) {
        TestParameter entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("TestParameter not found with id " + id));
        return mapToResponse(entity);
    }

    @Transactional
    public TestParameterResponse create(TestParameterRequest request) {
        TestParameter entity = new TestParameter();
        // map request to entity here
        TestParameter saved = repository.save(entity);
        return mapToResponse(saved);
    }

    @Transactional
    public TestParameterResponse update(Long id, TestParameterRequest request) {
        TestParameter entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("TestParameter not found with id " + id));
        // update entity from request here
        TestParameter updated = repository.save(entity);
        return mapToResponse(updated);
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }

    private TestParameterResponse mapToResponse(TestParameter entity) {
        TestParameterResponse response = new TestParameterResponse();
        // Assume Long id field for boilerplate
        try {
            response.setId(entity.getId());
        } catch(Exception e) {
            // Ignore if no getId() exists
        }
        return response;
    }
}
