package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.dto.LabTestRequest;
import com.healthcare.labtestbooking.dto.LabTestResponse;
import com.healthcare.labtestbooking.entity.LabTest;
import com.healthcare.labtestbooking.entity.User;
import com.healthcare.labtestbooking.entity.enums.UserRole;
import com.healthcare.labtestbooking.repository.LabTestRepository;
import com.healthcare.labtestbooking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TestService {

    private final LabTestRepository labTestRepository;
    private final UserRepository userRepository;

    public List<LabTestResponse> getAllTests() {
        return labTestRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public LabTestResponse getTestById(Long id) {
        LabTest labTest = labTestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Test not found with id: " + id));
        return mapToResponse(labTest);
    }

    @Transactional
    public LabTestResponse createTest(LabTestRequest request) {
        validateAdminAccess();

        LabTest labTest = LabTest.builder()
                .testName(request.getTestName())
                .price(request.getPrice())
                .fastingRequired(request.getFastingRequired() != null ? request.getFastingRequired() : false)
                .fastingHours(request.getFastingHours())
                .reportTimeHours(request.getReportTimeHours())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        labTest = labTestRepository.save(labTest);
        return mapToResponse(labTest);
    }

    @Transactional
    public LabTestResponse updateTest(Long id, LabTestRequest request) {
        validateAdminAccess();

        LabTest labTest = labTestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Test not found with id: " + id));

        labTest.setTestName(request.getTestName());
        labTest.setPrice(request.getPrice());
        if (request.getFastingRequired() != null) {
            labTest.setFastingRequired(request.getFastingRequired());
        }
        labTest.setFastingHours(request.getFastingHours());
        labTest.setReportTimeHours(request.getReportTimeHours());
        if (request.getIsActive() != null) {
            labTest.setIsActive(request.getIsActive());
        }

        labTest = labTestRepository.save(labTest);
        return mapToResponse(labTest);
    }

    @Transactional
    public void deleteTest(Long id) {
        validateAdminAccess();

        LabTest labTest = labTestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Test not found with id: " + id));

        labTest.setIsActive(false);
        labTestRepository.save(labTest);
    }

    public List<LabTestResponse> searchTestsByNameOrCategory(String keyword) {
        List<LabTest> testsByName = labTestRepository.searchTests(keyword);
        
        return testsByName.stream()
                .distinct()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private void validateAdminAccess() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        User currentUser = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (currentUser.getRole() != UserRole.ADMIN) {
            throw new RuntimeException("Admin access required");
        }
    }

    private LabTestResponse mapToResponse(LabTest labTest) {
        return LabTestResponse.builder()
                .id(labTest.getId())
                .testName(labTest.getTestName())
                .price(labTest.getPrice())
                .fastingRequired(labTest.getFastingRequired())
                .fastingHours(labTest.getFastingHours())
                .reportTimeHours(labTest.getReportTimeHours())
                .isActive(labTest.getIsActive())
                .build();
    }
}

