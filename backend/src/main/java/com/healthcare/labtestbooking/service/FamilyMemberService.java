package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.dto.FamilyMemberRequest;
import com.healthcare.labtestbooking.dto.FamilyMemberResponse;
import com.healthcare.labtestbooking.entity.FamilyMember;
import com.healthcare.labtestbooking.entity.User;
import com.healthcare.labtestbooking.repository.FamilyMemberRepository;
import com.healthcare.labtestbooking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FamilyMemberService {

    private final FamilyMemberRepository familyMemberRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public FamilyMemberResponse addFamilyMember(FamilyMemberRequest request) {
        User currentUser = getCurrentUser();
        
        FamilyMember familyMember = FamilyMember.builder()
                .patient(currentUser)
                .name(request.getName())
                .relation(request.getRelation())
                .dateOfBirth(request.getDateOfBirth())
                .gender(request.getGender())
                .bloodGroup(request.getBloodGroup())
                .build();
                
        familyMember = familyMemberRepository.save(familyMember);
        return mapToResponse(familyMember);
    }

    public List<FamilyMemberResponse> getFamilyMembers() {
        User currentUser = getCurrentUser();
        return familyMemberRepository.findByUserId(currentUser.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteFamilyMember(Long id) {
        User currentUser = getCurrentUser();
        FamilyMember familyMember = familyMemberRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Family member not found"));

        if (!familyMember.getPatient().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You do not have permission to delete this family member");
        }

        familyMemberRepository.delete(familyMember);
    }

    private FamilyMemberResponse mapToResponse(FamilyMember familyMember) {
        return FamilyMemberResponse.builder()
                .id(familyMember.getId())
                .name(familyMember.getName())
                .relation(familyMember.getRelation())
                .dateOfBirth(familyMember.getDateOfBirth())
                .gender(familyMember.getGender())
                .bloodGroup(familyMember.getBloodGroup())
                .patientId(familyMember.getPatient().getId())
                .build();
    }
}
