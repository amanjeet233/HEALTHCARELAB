package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.TestPackage;
import com.healthcare.labtestbooking.repository.TestPackageRepository;
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
public class TestPackageService {

    private final TestPackageRepository testPackageRepository;

    @Transactional
    public TestPackage savePackage(TestPackage testPackage) {
        log.info("Saving test package: {}", testPackage.getPackageName());
        return testPackageRepository.save(testPackage);
    }

    public Optional<TestPackage> getPackageById(Long id) {
        return testPackageRepository.findById(id);
    }

    public List<TestPackage> getAllPackages() {
        return testPackageRepository.findAll();
    }

    @Transactional
    public void deletePackage(Long id) {
        log.info("Deleting test package with id: {}", id);
        testPackageRepository.deleteById(id);
    }
}
