package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.ReportVerification;
import com.healthcare.labtestbooking.repository.ReportVerificationRepository;
import com.healthcare.labtestbooking.dto.ReportVerificationRequest;
import com.healthcare.labtestbooking.dto.ReportVerificationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportVerificationService {

    private final ReportVerificationRepository repository;

    @Transactional(readOnly = true)
    public List<ReportVerificationResponse> getAll() {
        return repository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ReportVerificationResponse getById(Long id) {
        ReportVerification entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("ReportVerification not found with id " + id));
        return mapToResponse(entity);
    }

    @Transactional
    public ReportVerificationResponse create(ReportVerificationRequest request) {
        ReportVerification entity = new ReportVerification();
        // map request to entity here
        ReportVerification saved = repository.save(entity);
        return mapToResponse(saved);
    }

    @Transactional
    public ReportVerificationResponse update(Long id, ReportVerificationRequest request) {
        ReportVerification entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("ReportVerification not found with id " + id));
        // update entity from request here
        ReportVerification updated = repository.save(entity);
        return mapToResponse(updated);
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }

    private ReportVerificationResponse mapToResponse(ReportVerification entity) {
        ReportVerificationResponse response = new ReportVerificationResponse();
        // Assume Long id field for boilerplate
        try {
            response.setId(entity.getId());
        } catch(Exception e) {
            // Ignore if no getId() exists
        }
        return response;
    }
}
