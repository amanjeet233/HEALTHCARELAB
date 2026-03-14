package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.QuizResult;
import com.healthcare.labtestbooking.repository.QuizResultRepository;
import com.healthcare.labtestbooking.dto.QuizResultRequest;
import com.healthcare.labtestbooking.dto.QuizResultResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuizResultService {

    private final QuizResultRepository repository;

    @Transactional(readOnly = true)
    public List<QuizResultResponse> getAll() {
        return repository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public QuizResultResponse getById(Long id) {
        QuizResult entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("QuizResult not found with id " + id));
        return mapToResponse(entity);
    }

    @Transactional
    public QuizResultResponse create(QuizResultRequest request) {
        QuizResult entity = new QuizResult();
        // map request to entity here
        QuizResult saved = repository.save(entity);
        return mapToResponse(saved);
    }

    @Transactional
    public QuizResultResponse update(Long id, QuizResultRequest request) {
        QuizResult entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("QuizResult not found with id " + id));
        // update entity from request here
        QuizResult updated = repository.save(entity);
        return mapToResponse(updated);
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }

    private QuizResultResponse mapToResponse(QuizResult entity) {
        QuizResultResponse response = new QuizResultResponse();
        // Assume Long id field for boilerplate
        try {
            response.setId(entity.getId());
        } catch(Exception e) {
            // Ignore if no getId() exists
        }
        return response;
    }
}
