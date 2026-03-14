package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.dto.LabTestDTO;
import com.healthcare.labtestbooking.dto.TestPackageDTO;
import com.healthcare.labtestbooking.entity.PackageTest;
import com.healthcare.labtestbooking.entity.TestPackage;
import com.healthcare.labtestbooking.repository.PackageTestRepository;
import com.healthcare.labtestbooking.repository.TestPackageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TestPackageService {

        private final TestPackageRepository testPackageRepository;
        private final PackageTestRepository packageTestRepository;
        private final LabTestService labTestService;

        public List<TestPackageDTO> getAllActivePackages() {
                log.info("Fetching all active test packages");
                return testPackageRepository.findByIsActiveTrue().stream()
                                .map(this::convertToDTO)
                                .collect(Collectors.toList());
        }

        public Page<TestPackageDTO> getAllActivePackages(Pageable pageable) {
                log.info("Fetching all active test packages with pagination | Page: {}, Size: {}",
                                pageable.getPageNumber(), pageable.getPageSize());
                return testPackageRepository.findByIsActiveTrue(pageable)
                                .map(this::convertToDTO);
        }

        @Cacheable(value = "packageById", key = "#id")
        public TestPackageDTO getPackageById(Long id) {
                log.info("Fetching package by ID: {}", id);
                TestPackage testPackage = testPackageRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Package not found with id: " + id));
                return convertToDTO(testPackage);
        }

        @Cacheable(value = "packageById", key = "#packageCode")
        public TestPackageDTO getPackageByCode(String packageCode) {
                log.info("Fetching package by code: {}", packageCode);
                TestPackage testPackage = testPackageRepository.findByPackageCode(packageCode)
                                .orElseThrow(() -> new RuntimeException("Package not found with code: " + packageCode));
                return convertToDTO(testPackage);
        }

        @Cacheable("bestDeals")
        public List<TestPackageDTO> getBestDeals() {
                log.info("Fetching best deals (highest discounts)");
                return testPackageRepository.findBestDeals().stream()
                                .map(this::convertToDTO)
                                .collect(Collectors.toList());
        }

        public List<TestPackageDTO> getPackagesByPriceRange(BigDecimal min, BigDecimal max) {
                log.info("Fetching packages in price range: {} - {}", min, max);
                return testPackageRepository.findByPriceRange(min, max).stream()
                                .map(this::convertToDTO)
                                .collect(Collectors.toList());
        }

        private TestPackageDTO convertToDTO(TestPackage testPackage) {
                List<PackageTest> packageTests = packageTestRepository
                                .findByTestPackageOrderByDisplayOrder(testPackage);

                List<LabTestDTO> tests = packageTests.stream()
                                .map(pt -> labTestService.getTestById(pt.getLabTest().getId()))
                                .collect(Collectors.toList());

                BigDecimal savings = testPackage.getTotalPrice().subtract(testPackage.getDiscountedPrice());

                return TestPackageDTO.builder()
                                .id(testPackage.getId())
                                .packageCode(testPackage.getPackageCode())
                                .packageName(testPackage.getPackageName())
                                .description(testPackage.getDescription())
                                .totalTests(testPackage.getTotalTests())
                                .totalPrice(testPackage.getTotalPrice())
                                .discountedPrice(testPackage.getDiscountedPrice())
                                .discountPercentage(testPackage.getDiscountPercentage())
                                .savings(savings)
                                .tests(tests)
                                .build();
        }

    public java.util.List<com.healthcare.labtestbooking.dto.TestPackageResponse> getAll() { return java.util.List.of(); }
    public com.healthcare.labtestbooking.dto.TestPackageResponse getById(Long id) { return null; }
    public com.healthcare.labtestbooking.dto.TestPackageResponse create(com.healthcare.labtestbooking.dto.TestPackageRequest request) { return null; }
    public com.healthcare.labtestbooking.dto.TestPackageResponse update(Long id, com.healthcare.labtestbooking.dto.TestPackageRequest request) { return null; }
    public void delete(Long id) { }
}

