package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.GatewayPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GatewayPaymentRepository extends JpaRepository<GatewayPayment, Long> {

    Optional<GatewayPayment> findByTransactionId(String transactionId);
}
