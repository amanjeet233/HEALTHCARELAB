package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.TestPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestPackageRepository extends JpaRepository<TestPackage, Long> {

    List<TestPackage> findByIsActiveTrue();
}
