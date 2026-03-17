package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.QuizResult;
import com.healthcare.labtestbooking.repository.QuizResultRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class QuizResultService {

    private final QuizResultRepository quizResultRepository;

    @Transactional
    public QuizResult saveQuizResult(QuizResult quizResult) {
        log.info("Saving quiz result for user id: {}", quizResult.getUser().getId());
        return quizResultRepository.save(quizResult);
    }

    public Optional<QuizResult> getQuizResultById(Long id) {
        return quizResultRepository.findById(id);
    }

    public List<QuizResult> getAllQuizResults() {
        return quizResultRepository.findAll();
    }

    @Transactional
    public void deleteQuizResult(Long id) {
        log.info("Deleting quiz result with id: {}", id);
        quizResultRepository.deleteById(id);
    }
}
