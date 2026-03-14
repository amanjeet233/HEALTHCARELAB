package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.TestPopularity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TestPopularityRepository extends JpaRepository<TestPopularity, Long> {

    Optional<TestPopularity> findByTestId(Long testId);

    Optional<TestPopularity> findByPackageId(Long packageId);

    List<TestPopularity> findByTestIdIsNotNull();

    List<TestPopularity> findByTestIdIsNotNullAndLastViewedAfter(LocalDateTime since);
}
