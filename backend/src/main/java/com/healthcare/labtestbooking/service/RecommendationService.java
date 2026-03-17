package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.Recommendation;
import com.healthcare.labtestbooking.repository.RecommendationRepository;
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
public class RecommendationService {

    private final RecommendationRepository recommendationRepository;

    @Transactional
    public Recommendation saveRecommendation(Recommendation recommendation) {
        log.info("Saving recommendation for booking id: {}", recommendation.getBooking().getId());
        return recommendationRepository.save(recommendation);
    }

    public Optional<Recommendation> getRecommendationByBookingId(Long bookingId) {
        return recommendationRepository.findByBookingId(bookingId);
    }

    public List<Recommendation> getAllRecommendations() {
        return recommendationRepository.findAll();
    }

    @Transactional
    public void deleteRecommendation(Long id) {
        log.info("Deleting recommendation with id: {}", id);
        recommendationRepository.deleteById(id);
    }
}
