package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.TestCategory;
import com.healthcare.labtestbooking.repository.TestCategoryRepository;
import com.healthcare.labtestbooking.dto.TestCategoryRequest;
import com.healthcare.labtestbooking.dto.TestCategoryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TestCategoryService {

    private final TestCategoryRepository repository;

    @Transactional(readOnly = true)
    public List<TestCategoryResponse> getAll() {
        return repository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TestCategoryResponse getById(Long id) {
        TestCategory entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("TestCategory not found with id " + id));
        return mapToResponse(entity);
    }

    @Transactional
    public TestCategoryResponse create(TestCategoryRequest request) {
        TestCategory entity = new TestCategory();
        // map request to entity here
        TestCategory saved = repository.save(entity);
        return mapToResponse(saved);
    }

    @Transactional
    public TestCategoryResponse update(Long id, TestCategoryRequest request) {
        TestCategory entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("TestCategory not found with id " + id));
        // update entity from request here
        TestCategory updated = repository.save(entity);
        return mapToResponse(updated);
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }

    private TestCategoryResponse mapToResponse(TestCategory entity) {
        TestCategoryResponse response = new TestCategoryResponse();
        // Assume Long id field for boilerplate
        try {
            response.setId(entity.getId());
        } catch(Exception e) {
            // Ignore if no getId() exists
        }
        return response;
    }
}
