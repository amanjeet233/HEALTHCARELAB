package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.ReportResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportResultRepository extends JpaRepository<ReportResult, Long> {

    List<ReportResult> findByBookingId(Long bookingId);

    List<ReportResult> findByBookingPatientIdOrderByCreatedAtDesc(Long patientId);

    List<ReportResult> findByReportId(Long reportId);

    List<ReportResult> findByReportIdAndIsCriticalTrue(Long reportId);
}
