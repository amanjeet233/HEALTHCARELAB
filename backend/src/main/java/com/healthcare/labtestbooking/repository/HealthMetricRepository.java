package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.HealthMetric;
import com.healthcare.labtestbooking.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HealthMetricRepository extends JpaRepository<HealthMetric, Long> {
    List<HealthMetric> findByUserOrderByMeasuredAtDesc(User user);
    List<HealthMetric> findByUserIdOrderByMeasuredAtDesc(Long userId);

    @Query("SELECT hm FROM HealthMetric hm WHERE hm.user.id = :userId AND hm.metricCode = :metricCode ORDER BY hm.measuredAt ASC")
    List<HealthMetric> findTrendsByUserIdAndMetricCode(Long userId, String metricCode);
}
