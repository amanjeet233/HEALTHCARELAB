package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.HealthMetric;
import com.healthcare.labtestbooking.repository.HealthMetricRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HealthInsightsService {

    private final HealthMetricRepository healthMetricRepository;

    public List<HealthMetric> getLatestMetrics(Long userId) {
        return healthMetricRepository.findByUserIdOrderByMeasuredAtDesc(userId);
    }

    public Map<String, List<HealthMetric>> getMetricTrends(Long userId) {
        List<HealthMetric> allMetrics = healthMetricRepository.findByUserIdOrderByMeasuredAtDesc(userId);
        return allMetrics.stream()
                .collect(Collectors.groupingBy(HealthMetric::getMetricCode));
    }

    @Transactional
    public HealthMetric saveMetric(HealthMetric metric) {
        return healthMetricRepository.save(metric);
    }
}
