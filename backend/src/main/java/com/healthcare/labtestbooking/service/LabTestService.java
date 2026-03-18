package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.dto.LabTestDTO;
import com.healthcare.labtestbooking.dto.TestParameterDTO;
import com.healthcare.labtestbooking.entity.LabTest;
import com.healthcare.labtestbooking.entity.TestCategory;
import com.healthcare.labtestbooking.entity.TestParameter;
import com.healthcare.labtestbooking.entity.enums.TestType;
import com.healthcare.labtestbooking.repository.LabTestRepository;
import com.healthcare.labtestbooking.repository.TestCategoryRepository;
import com.healthcare.labtestbooking.repository.TestParameterRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LabTestService {

        private final LabTestRepository labTestRepository;
        private final TestCategoryRepository testCategoryRepository;
        private final TestParameterRepository testParameterRepository;

        public List<LabTestDTO> getPopularTests() {
                log.info("Fetching popular lab tests");
                // Simplified: returns first 5 active tests as popular
                return labTestRepository.findByIsActiveTrue().stream()
                                .limit(5)
                                .map(this::convertToDTO)
                                .collect(Collectors.toList());
        }

        @Cacheable(value = "tests", key = "'all'")
        public List<LabTestDTO> getAllActiveTests() {
                log.info("Fetching all active lab tests");
                return labTestRepository.findByIsActiveTrue().stream()
                                .map(this::convertToDTO)
                                .collect(Collectors.toList());
        }

        @Cacheable(value = "testById", key = "#id")
        public LabTestDTO getTestById(Long id) {
                log.info("Fetching test by ID: {}", id);
                LabTest test = labTestRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Test not found with id: " + id));
                return convertToDTO(test);
        }

        public LabTestDTO getTestByCode(String testCode) {
                log.info("Fetching test by code: {}", testCode);
                LabTest test = labTestRepository.findByTestCode(testCode)
                                .orElseThrow(() -> new RuntimeException("Test not found with code: " + testCode));
                return convertToDTO(test);
        }

        @Cacheable(value = "testsByCategory", key = "#categoryId")
        public List<LabTestDTO> getTestsByCategory(Long categoryId) {
                log.info("Fetching tests by category ID: {}", categoryId);
                TestCategory category = testCategoryRepository.findById(categoryId)
                                .orElseThrow(() -> new RuntimeException("Category not found with id: " + categoryId));

                return labTestRepository.findByCategory(category).stream()
                                .map(this::convertToDTO)
                                .collect(Collectors.toList());
        }

        public List<LabTestDTO> getTestsByType(TestType testType) {
                log.info("Fetching tests by type: {}", testType);
                return labTestRepository.findByTestType(testType).stream()
                                .map(this::convertToDTO)
                                .collect(Collectors.toList());
        }

        public List<LabTestDTO> searchTests(String keyword) {
                log.info("Searching tests with keyword: {}", keyword);
                return labTestRepository.searchTests(keyword).stream()
                                .map(this::convertToDTO)
                                .collect(Collectors.toList());
        }

        public List<LabTestDTO> getTestsByPriceRange(BigDecimal min, BigDecimal max) {
                log.info("Fetching tests in price range: {} - {}", min, max);
                return labTestRepository.findByPriceRange(min, max).stream()
                                .map(this::convertToDTO)
                                .collect(Collectors.toList());
        }

        @Cacheable("typesList")
        public List<TestType> getAllTestTypes() {
                return labTestRepository.findAllTestTypes();
        }

        // ===== Paginated Methods =====

        public Page<LabTestDTO> getAllActiveTests(Pageable pageable) {
                log.info("Fetching all active lab tests with pagination | Page: {}, Size: {}",
                                pageable.getPageNumber(), pageable.getPageSize());
                return labTestRepository.findByIsActiveTrue(pageable)
                                .map(this::convertToDTO);
        }

        public Page<LabTestDTO> getTestsByCategory(Long categoryId, Pageable pageable) {
                log.info("Fetching tests by category ID: {} with pagination | Page: {}, Size: {}",
                                categoryId, pageable.getPageNumber(), pageable.getPageSize());
                TestCategory category = testCategoryRepository.findById(categoryId)
                                .orElseThrow(() -> new RuntimeException("Category not found with id: " + categoryId));
                return labTestRepository.findByCategory(category, pageable)
                                .map(this::convertToDTO);
        }

        public Page<LabTestDTO> getTestsByType(TestType testType, Pageable pageable) {
                log.info("Fetching tests by type: {} with pagination | Page: {}, Size: {}",
                                testType, pageable.getPageNumber(), pageable.getPageSize());
                return labTestRepository.findByTestType(testType, pageable)
                                .map(this::convertToDTO);
        }

        public Page<LabTestDTO> searchTests(String keyword, Pageable pageable) {
                log.info("Searching tests with keyword: {} and pagination | Page: {}, Size: {}",
                                keyword, pageable.getPageNumber(), pageable.getPageSize());
                return labTestRepository.searchTests(keyword, pageable)
                                .map(this::convertToDTO);
        }

        public Page<LabTestDTO> getTestsByPriceRange(BigDecimal min, BigDecimal max, Pageable pageable) {
                log.info("Fetching tests in price range: {} - {} with pagination | Page: {}, Size: {}",
                                min, max, pageable.getPageNumber(), pageable.getPageSize());
                return labTestRepository.findByPriceRange(min, max, pageable)
                                .map(this::convertToDTO);
        }

        private LabTestDTO convertToDTO(LabTest test) {
                List<TestParameterDTO> parameters = testParameterRepository.findByTestOrderByDisplayOrder(test)
                                .stream()
                                .map(this::convertParameterToDTO)
                                .collect(Collectors.toList());

                return LabTestDTO.builder()
                                .id(test.getId())
                                .testCode(test.getTestCode())
                                .testName(test.getTestName())
                                .categoryId(test.getCategory() != null ? test.getCategory().getId() : null)
                                .categoryName(test.getCategory() != null ? test.getCategory().getCategoryName() : null)
                                .testType(test.getTestType() != null ? test.getTestType().name() : null)
                                .methodology(test.getMethodology())
                                .unit(test.getUnit())
                                .normalRangeMin(test.getNormalRangeMin())
                                .normalRangeMax(test.getNormalRangeMax())
                                .normalRangeText(test.getNormalRangeText())
                                .fastingRequired(test.getFastingRequired())
                                .fastingHours(test.getFastingHours())
                                .reportTimeHours(test.getReportTimeHours())
                                .price(test.getPrice())
                                .parameters(parameters)
                                .build();
        }

        private TestParameterDTO convertParameterToDTO(TestParameter parameter) {
                return TestParameterDTO.builder()
                                .id(parameter.getId())
                                .parameterName(parameter.getParameterName())
                                .unit(parameter.getUnit())
                                .normalRangeMin(parameter.getNormalRangeMin())
                                .normalRangeMax(parameter.getNormalRangeMax())
                                .normalRangeText(parameter.getNormalRangeText())
                                .build();
        }
}
