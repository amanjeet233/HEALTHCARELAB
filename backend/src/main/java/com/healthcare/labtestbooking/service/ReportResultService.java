package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.ReportResult;
import com.healthcare.labtestbooking.repository.ReportResultRepository;
import com.healthcare.labtestbooking.dto.ReportResultRequest;
import com.healthcare.labtestbooking.dto.ReportResultResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportResultService {

    private final ReportResultRepository repository;

    @Transactional(readOnly = true)
    public List<ReportResultResponse> getAll() {
        return repository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ReportResultResponse getById(Long id) {
        ReportResult entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("ReportResult not found with id " + id));
        return mapToResponse(entity);
    }

    @Transactional
    public ReportResultResponse create(ReportResultRequest request) {
        ReportResult entity = new ReportResult();
        // map request to entity here
        ReportResult saved = repository.save(entity);
        return mapToResponse(saved);
    }

    @Transactional
    public ReportResultResponse update(Long id, ReportResultRequest request) {
        ReportResult entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("ReportResult not found with id " + id));
        // update entity from request here
        ReportResult updated = repository.save(entity);
        return mapToResponse(updated);
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }

    private ReportResultResponse mapToResponse(ReportResult entity) {
        ReportResultResponse response = new ReportResultResponse();
        // Assume Long id field for boilerplate
        try {
            response.setId(entity.getId());
        } catch(Exception e) {
            // Ignore if no getId() exists
        }
        return response;
    }
}
