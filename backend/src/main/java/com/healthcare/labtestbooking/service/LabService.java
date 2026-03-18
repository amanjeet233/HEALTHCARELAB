package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.LabPartner;
import com.healthcare.labtestbooking.entity.LabTestPricing;
import com.healthcare.labtestbooking.repository.LabPartnerRepository;
import com.healthcare.labtestbooking.repository.LabTestPricingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class LabService {

    private final LabPartnerRepository labPartnerRepository;
    private final LabTestPricingRepository labTestPricingRepository;

    /**
     * Get nearby labs using Haversine formula
     * @param lat Latitude
     * @param lng Longitude
     * @param radiusKm Radius in kilometers
     * @return List of labs with distance information
     */
    public List<Map<String, Object>> getNearbyLabs(double lat, double lng, double radiusKm) {
        log.info("Finding labs near ({}, {}) within {}km", lat, lng, radiusKm);

        List<Object[]> results = labPartnerRepository.findNearbyLabs(lat, lng, radiusKm);
        List<Map<String, Object>> labs = new ArrayList<>();

        for (Object[] row : results) {
            Map<String, Object> labData = new LinkedHashMap<>();
            labData.put("id", row[0]);
            labData.put("labName", row[1]);
            labData.put("accreditation", row[2]);
            labData.put("rating", row[3]);
            labData.put("homeCollection", row[4]);
            labData.put("address", row[5]);
            labData.put("city", row[6]);
            labData.put("contact", row[7]);
            labData.put("phone", row[8]);
            labData.put("email", row[9]);
            labData.put("website", row[10]);
            labData.put("latitude", row[11]);
            labData.put("longitude", row[12]);
            labData.put("workingHours", row[13]);
            labData.put("isActive", row[14]);
            // Last field is the calculated distance
            labData.put("distanceKm", row[row.length - 1]);
            labs.add(labData);
        }

        log.info("Found {} labs within {}km radius", labs.size(), radiusKm);
        return labs;
    }

    /**
     * Get labs by city name
     * @param city City name (case-insensitive)
     * @return List of labs in the city
     */
    public List<LabPartner> getLabsByCity(String city) {
        log.info("Finding labs in city: {}", city);
        List<LabPartner> labs = labPartnerRepository.findByCityIgnoreCase(city);
        log.info("Found {} labs in {}", labs.size(), city);
        return labs;
    }

    /**
     * Get lab by ID
     * @param id Lab ID
     * @return Lab details
     */
    public LabPartner getLabById(Long id) {
        log.info("Fetching lab with id: {}", id);
        return labPartnerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lab not found with id: " + id));
    }

    /**
     * Compare prices for a specific test across all labs
     * @param testId Test ID to compare
     * @return List of price comparisons
     */
    public List<Map<String, Object>> comparePrices(Long testId) {
        log.info("Comparing prices for test id: {}", testId);

        List<LabTestPricing> pricings = labTestPricingRepository.findByTestIdAndIsActiveTrue(testId);

        return pricings.stream()
                .sorted(Comparator.comparing(LabTestPricing::getPrice))
                .map(pricing -> {
                    Map<String, Object> comparison = new LinkedHashMap<>();
                    comparison.put("labId", pricing.getLabPartner().getId());
                    comparison.put("labName", pricing.getLabPartner().getLabName());
                    comparison.put("testId", pricing.getTest().getId());
                    comparison.put("testName", pricing.getTest().getTestName());
                    comparison.put("price", pricing.getPrice());
                    comparison.put("discountedPrice", pricing.getFinalPrice());
                    comparison.put("discount", pricing.getDiscount());
                    comparison.put("turnaroundTimeHours", pricing.getTurnaroundTimeHours());
                    comparison.put("accreditation", pricing.getLabPartner().getAccreditation());
                    comparison.put("rating", pricing.getLabPartner().getRating());
                    return comparison;
                })
                .collect(Collectors.toList());
    }

    /**
     * Get the best deal (cheapest lab) for a specific test
     * @param testId Test ID
     * @return Best deal information
     */
    public Map<String, Object> getBestDeal(Long testId) {
        log.info("Finding best deal for test id: {}", testId);

        List<LabTestPricing> pricings = labTestPricingRepository.findByTestIdOrderByPrice(testId);

        if (pricings.isEmpty()) {
            throw new RuntimeException("No pricing found for test id: " + testId);
        }

        LabTestPricing bestDeal = pricings.get(0);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("labId", bestDeal.getLabPartner().getId());
        result.put("labName", bestDeal.getLabPartner().getLabName());
        result.put("testId", bestDeal.getTest().getId());
        result.put("testName", bestDeal.getTest().getTestName());
        result.put("price", bestDeal.getPrice());
        result.put("discountedPrice", bestDeal.getFinalPrice());
        result.put("savings", calculateSavings(pricings));
        result.put("address", bestDeal.getLabPartner().getAddress());
        result.put("city", bestDeal.getLabPartner().getCity());
        result.put("rating", bestDeal.getLabPartner().getRating());
        result.put("homeCollection", bestDeal.getLabPartner().getHomeCollection());

        log.info("Best deal found: {} at {}", bestDeal.getLabPartner().getLabName(), bestDeal.getPrice());
        return result;
    }

    private BigDecimal calculateSavings(List<LabTestPricing> pricings) {
        if (pricings.size() < 2) {
            return BigDecimal.ZERO;
        }
        BigDecimal lowestPrice = pricings.get(0).getPrice();
        BigDecimal highestPrice = pricings.get(pricings.size() - 1).getPrice();
        return highestPrice.subtract(lowestPrice);
    }
}
