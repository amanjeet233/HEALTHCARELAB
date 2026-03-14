package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.QuizResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizResultRepository extends JpaRepository<QuizResult, Long> {

    List<QuizResult> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<QuizResult> findFirstByUserIdOrderByCreatedAtDesc(Long userId);
}
