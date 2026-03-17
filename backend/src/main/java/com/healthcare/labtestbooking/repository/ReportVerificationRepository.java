package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.ReportVerification;
import com.healthcare.labtestbooking.entity.enums.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReportVerificationRepository extends JpaRepository<ReportVerification, Long> {

    List<ReportVerification> findByStatusOrderByCreatedAtDesc(VerificationStatus status);

    Optional<ReportVerification> findByBookingId(Long bookingId);
}
