package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.UserHealthData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserHealthDataRepository extends JpaRepository<UserHealthData, Long> {
    Optional<UserHealthData> findByUserId(Long userId);
}
