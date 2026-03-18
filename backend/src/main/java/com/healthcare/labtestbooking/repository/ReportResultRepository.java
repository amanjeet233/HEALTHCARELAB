package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.ReportResult;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportResultRepository extends JpaRepository<ReportResult, Long> {

    @EntityGraph(attributePaths = {"parameter", "booking", "booking.test"})
    List<ReportResult> findByBookingId(Long bookingId);

    @EntityGraph(attributePaths = {"parameter"})
    List<ReportResult> findByBookingPatientIdOrderByCreatedAtDesc(Long patientId);

    @EntityGraph(attributePaths = {"parameter"})
    List<ReportResult> findByReportId(Long reportId);

    @EntityGraph(attributePaths = {"parameter"})
    List<ReportResult> findByReportIdAndIsCriticalTrue(Long reportId);
}
