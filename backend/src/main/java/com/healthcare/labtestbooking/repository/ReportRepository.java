package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {

    Optional<Report> findByBookingId(Long bookingId);

    Optional<Report> findByOrderId(Long orderId);
}
