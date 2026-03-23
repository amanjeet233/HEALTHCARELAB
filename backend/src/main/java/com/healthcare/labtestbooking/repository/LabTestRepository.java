package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.LabTest;
import com.healthcare.labtestbooking.entity.TestCategory;
import com.healthcare.labtestbooking.entity.enums.TestType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface LabTestRepository extends JpaRepository<LabTest, Long> {
    Optional<LabTest> findByTestCode(String testCode);
    List<LabTest> findByCategory(TestCategory category);
    Page<LabTest> findByCategory(TestCategory category, Pageable pageable);
    List<LabTest> findByTestType(TestType testType);
    Page<LabTest> findByTestType(TestType testType, Pageable pageable);
    List<LabTest> findByIsActiveTrue();
    Page<LabTest> findByIsActiveTrue(Pageable pageable);
    
    @Query("SELECT t FROM LabTest t WHERE t.testName LIKE %:keyword% OR t.testCode LIKE %:keyword%")
    List<LabTest> searchTests(@Param("keyword") String keyword);
    
    @Query("SELECT t FROM LabTest t WHERE t.testName LIKE %:keyword% OR t.testCode LIKE %:keyword%")
    Page<LabTest> searchTests(@Param("keyword") String keyword, Pageable pageable);
    
    @Query("SELECT t FROM LabTest t WHERE t.price BETWEEN :minPrice AND :maxPrice")
    List<LabTest> findByPriceRange(@Param("minPrice") BigDecimal minPrice, @Param("maxPrice") BigDecimal maxPrice);
    
    @Query("SELECT t FROM LabTest t WHERE t.price BETWEEN :minPrice AND :maxPrice")
    Page<LabTest> findByPriceRange(@Param("minPrice") BigDecimal minPrice, @Param("maxPrice") BigDecimal maxPrice, Pageable pageable);
    
    @Query("SELECT DISTINCT t.testType FROM LabTest t")
    List<TestType> findAllTestTypes();

    // Doctor Test Management queries
    boolean existsByTestCode(String testCode);

    @Query("SELECT t FROM LabTest t WHERE t.category.id = :categoryId AND t.isActive = true")
    List<LabTest> findByCategoryIdAndIsActiveTrue(@Param("categoryId") Long categoryId);

    @Query("SELECT t FROM LabTest t WHERE LOWER(t.testName) LIKE LOWER(CONCAT('%', :testName, '%')) AND t.isActive = true")
    List<LabTest> findByTestNameContainingIgnoreCaseAndIsActiveTrue(@Param("testName") String testName);
}

