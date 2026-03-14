package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.ReportResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportResultRepository extends JpaRepository<ReportResult, Long> {

    List<ReportResult> findByBookingId(Long bookingId);

    List<ReportResult> findByReportId(Long reportId);

    List<ReportResult> findByParameterIdAndBookingPatientId(Long parameterId, Long patientId);

    List<ReportResult> findByBookingIdAndIsAbnormalTrue(Long bookingId);

    List<ReportResult> findByReportIdAndIsCriticalTrue(Long reportId);

    List<ReportResult> findByBookingPatientIdOrderByCreatedAtDesc(Long patientId);

    void deleteByBookingId(Long bookingId);
}
