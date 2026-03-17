package com.healthcare.labtestbooking.repository;

import com.healthcare.labtestbooking.entity.GatewayPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GatewayPaymentRepository extends JpaRepository<GatewayPayment, Long> {
    java.util.Optional<GatewayPayment> findByTransactionId(String transactionId);
    java.util.List<GatewayPayment> findByOrderId(Long orderId);
}
