package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.UserHealthData;
import com.healthcare.labtestbooking.repository.UserHealthDataRepository;
import com.healthcare.labtestbooking.dto.UserHealthDataRequest;
import com.healthcare.labtestbooking.dto.UserHealthDataResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserHealthDataService {

    private final UserHealthDataRepository repository;

    @Transactional(readOnly = true)
    public List<UserHealthDataResponse> getAll() {
        return repository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserHealthDataResponse getById(Long id) {
        UserHealthData entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("UserHealthData not found with id " + id));
        return mapToResponse(entity);
    }

    @Transactional
    public UserHealthDataResponse create(UserHealthDataRequest request) {
        UserHealthData entity = new UserHealthData();
        // map request to entity here
        UserHealthData saved = repository.save(entity);
        return mapToResponse(saved);
    }

    @Transactional
    public UserHealthDataResponse update(Long id, UserHealthDataRequest request) {
        UserHealthData entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("UserHealthData not found with id " + id));
        // update entity from request here
        UserHealthData updated = repository.save(entity);
        return mapToResponse(updated);
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }

    private UserHealthDataResponse mapToResponse(UserHealthData entity) {
        UserHealthDataResponse response = new UserHealthDataResponse();
        // Assume Long id field for boilerplate
        try {
            response.setId(entity.getId());
        } catch(Exception e) {
            // Ignore if no getId() exists
        }
        return response;
    }
}
