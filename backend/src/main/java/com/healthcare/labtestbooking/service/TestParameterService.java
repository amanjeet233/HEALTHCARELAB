package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.TestParameter;
import com.healthcare.labtestbooking.repository.TestParameterRepository;
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
public class TestParameterService {

    private final TestParameterRepository testParameterRepository;

    @Transactional
    public TestParameter saveParameter(TestParameter parameter) {
        log.info("Saving test parameter: {}", parameter.getParameterName());
        return testParameterRepository.save(parameter);
    }

    public List<TestParameter> getParametersByTestId(Long testId) {
        // Assuming repository has findByTestId or similar. If not, use findAll and
        // filter for now or add to repo.
        return testParameterRepository.findAll().stream()
                .filter(p -> p.getTest() != null && p.getTest().getId().equals(testId))
                .toList();
    }

    public Optional<TestParameter> getParameterById(Long id) {
        return testParameterRepository.findById(id);
    }

    public List<TestParameter> getAllParameters() {
        return testParameterRepository.findAll();
    }
}
