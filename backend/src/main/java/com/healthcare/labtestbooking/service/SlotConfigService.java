package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.SlotConfig;
import com.healthcare.labtestbooking.repository.SlotConfigRepository;
import com.healthcare.labtestbooking.dto.SlotConfigRequest;
import com.healthcare.labtestbooking.dto.SlotConfigResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SlotConfigService {

    private final SlotConfigRepository repository;

    @Transactional(readOnly = true)
    public List<SlotConfigResponse> getAll() {
        return repository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SlotConfigResponse getById(Long id) {
        SlotConfig entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("SlotConfig not found with id " + id));
        return mapToResponse(entity);
    }

    @Transactional
    public SlotConfigResponse create(SlotConfigRequest request) {
        SlotConfig entity = new SlotConfig();
        // map request to entity here
        SlotConfig saved = repository.save(entity);
        return mapToResponse(saved);
    }

    @Transactional
    public SlotConfigResponse update(Long id, SlotConfigRequest request) {
        SlotConfig entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("SlotConfig not found with id " + id));
        // update entity from request here
        SlotConfig updated = repository.save(entity);
        return mapToResponse(updated);
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }

    private SlotConfigResponse mapToResponse(SlotConfig entity) {
        SlotConfigResponse response = new SlotConfigResponse();
        // Assume Long id field for boilerplate
        try {
            response.setId(entity.getId());
        } catch(Exception e) {
            // Ignore if no getId() exists
        }
        return response;
    }
}
