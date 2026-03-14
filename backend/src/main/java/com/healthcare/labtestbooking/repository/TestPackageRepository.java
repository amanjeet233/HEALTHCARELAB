package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.TestPackage;
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
public interface TestPackageRepository extends JpaRepository<TestPackage, Long> {
    Optional<TestPackage> findByPackageCode(String packageCode);
    List<TestPackage> findByIsActiveTrue();
    Page<TestPackage> findByIsActiveTrue(Pageable pageable);
    
    @Query("SELECT p FROM TestPackage p WHERE p.discountedPrice BETWEEN :minPrice AND :maxPrice")
    List<TestPackage> findByPriceRange(@Param("minPrice") BigDecimal minPrice, @Param("maxPrice") BigDecimal maxPrice);
    
    @Query("SELECT p FROM TestPackage p ORDER BY p.discountPercentage DESC")
    List<TestPackage> findBestDeals();
}
