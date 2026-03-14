package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.LabTest;
import com.healthcare.labtestbooking.entity.TestPopularity;
import com.healthcare.labtestbooking.repository.LabTestRepository;
import com.healthcare.labtestbooking.repository.TestPopularityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PopularityService {

    private static final String POPULAR_TESTS_KEY = "popular:tests";
    private static final double VIEW_WEIGHT = 0.3;
    private static final double BOOKING_WEIGHT = 0.7;

    private final TestPopularityRepository testPopularityRepository;
    private final LabTestRepository labTestRepository;
    private final Optional<StringRedisTemplate> redisTemplate;

    public void recordTestView(Long testId) {
        if (testId == null) {
            return;
        }
        TestPopularity popularity = testPopularityRepository.findByTestId(testId)
            .orElseGet(() -> TestPopularity.builder().testId(testId).build());
        popularity.setViewCount(popularity.getViewCount() + 1);
        popularity.setLastViewed(LocalDateTime.now());
        testPopularityRepository.save(popularity);
    }

    public void recordTestBooking(Long testId) {
        if (testId == null) {
            return;
        }
        TestPopularity popularity = testPopularityRepository.findByTestId(testId)
            .orElseGet(() -> TestPopularity.builder().testId(testId).build());
        popularity.setBookingCount(popularity.getBookingCount() + 1);
        testPopularityRepository.save(popularity);
    }

    public List<LabTest> getPopularTests(int limit) {
        List<TestPopularity> popularity = testPopularityRepository.findByTestIdIsNotNull();
        List<Long> sortedIds = popularity.stream()
            .sorted(Comparator.comparingDouble(this::calculateScore).reversed())
            .limit(limit)
            .map(TestPopularity::getTestId)
            .collect(Collectors.toList());

        return fetchTestsInOrder(sortedIds);
    }

    public List<LabTest> getTrendingTests(int days, int limit) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        List<TestPopularity> popularity = testPopularityRepository
            .findByTestIdIsNotNullAndLastViewedAfter(since);
        List<Long> sortedIds = popularity.stream()
            .sorted(Comparator.comparing(TestPopularity::getViewCount).reversed())
            .limit(limit)
            .map(TestPopularity::getTestId)
            .collect(Collectors.toList());

        return fetchTestsInOrder(sortedIds);
    }

    public void refreshPopularCache(int limit) {
        List<Long> testIds = testPopularityRepository.findByTestIdIsNotNull().stream()
            .sorted(Comparator.comparingDouble(this::calculateScore).reversed())
            .limit(limit)
            .map(TestPopularity::getTestId)
            .collect(Collectors.toList());

        redisTemplate.ifPresent(template -> {
            try {
                if (testIds.isEmpty()) {
                    template.delete(POPULAR_TESTS_KEY);
                } else {
                    template.opsForValue().set(POPULAR_TESTS_KEY, joinIds(testIds));
                }
            } catch (Exception ex) {
                log.warn("Failed to update Redis popular tests cache", ex);
            }
        });
    }

    public List<Long> getCachedPopularTestIds() {
        return redisTemplate.map(template -> {
            try {
                String value = template.opsForValue().get(POPULAR_TESTS_KEY);
                return parseIds(value);
            } catch (Exception ex) {
                log.warn("Failed to read Redis popular tests cache", ex);
                return List.<Long>of();
            }
        }).orElseGet(List::of);
    }

    private double calculateScore(TestPopularity popularity) {
        double views = popularity.getViewCount() != null ? popularity.getViewCount() : 0;
        double bookings = popularity.getBookingCount() != null ? popularity.getBookingCount() : 0;
        return (VIEW_WEIGHT * views) + (BOOKING_WEIGHT * bookings);
    }

    private List<LabTest> fetchTestsInOrder(List<Long> ids) {
        if (ids.isEmpty()) {
            return List.of();
        }
        Map<Long, LabTest> testMap = labTestRepository.findAllById(ids).stream()
            .collect(Collectors.toMap(LabTest::getId, test -> test));
        List<LabTest> ordered = new ArrayList<>();
        for (Long id : ids) {
            LabTest test = testMap.get(id);
            if (test != null) {
                ordered.add(test);
            }
        }
        return ordered;
    }

    private String joinIds(List<Long> ids) {
        return ids.stream().map(String::valueOf).collect(Collectors.joining(","));
    }

    private List<Long> parseIds(String value) {
        if (value == null || value.trim().isEmpty()) {
            return List.of();
        }
        String[] parts = value.toLowerCase(Locale.ROOT).split(",");
        List<Long> ids = new ArrayList<>();
        for (String part : parts) {
            try {
                ids.add(Long.parseLong(part.trim()));
            } catch (NumberFormatException ignored) {
                // ignore invalid cache entries
            }
        }
        return ids;
    }
}
