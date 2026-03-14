package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.Recommendation;
import com.healthcare.labtestbooking.repository.RecommendationRepository;
import com.healthcare.labtestbooking.dto.RecommendationRequest;
import com.healthcare.labtestbooking.dto.RecommendationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final RecommendationRepository repository;

    @Transactional(readOnly = true)
    public List<RecommendationResponse> getAll() {
        return repository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RecommendationResponse getById(Long id) {
        Recommendation entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recommendation not found with id " + id));
        return mapToResponse(entity);
    }

    @Transactional
    public RecommendationResponse create(RecommendationRequest request) {
        Recommendation entity = new Recommendation();
        // map request to entity here
        Recommendation saved = repository.save(entity);
        return mapToResponse(saved);
    }

    @Transactional
    public RecommendationResponse update(Long id, RecommendationRequest request) {
        Recommendation entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recommendation not found with id " + id));
        // update entity from request here
        Recommendation updated = repository.save(entity);
        return mapToResponse(updated);
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }

    private RecommendationResponse mapToResponse(Recommendation entity) {
        RecommendationResponse response = new RecommendationResponse();
        // Assume Long id field for boilerplate
        try {
            response.setId(entity.getId());
        } catch(Exception e) {
            // Ignore if no getId() exists
        }
        return response;
    }
}
