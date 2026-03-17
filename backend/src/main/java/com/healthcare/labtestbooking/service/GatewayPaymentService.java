package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.GatewayPayment;
import com.healthcare.labtestbooking.repository.GatewayPaymentRepository;
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
public class GatewayPaymentService {

    private final GatewayPaymentRepository gatewayPaymentRepository;

    @Transactional
    public GatewayPayment saveGatewayPayment(GatewayPayment gatewayPayment) {
        log.info("Saving gateway payment for order id: {} with transaction id: {}",
                gatewayPayment.getOrder() != null ? gatewayPayment.getOrder().getId() : "null",
                gatewayPayment.getTransactionId());
        return gatewayPaymentRepository.save(gatewayPayment);
    }

    public Optional<GatewayPayment> getGatewayPaymentByTransactionId(String transactionId) {
        return gatewayPaymentRepository.findByTransactionId(transactionId);
    }

    public List<GatewayPayment> getGatewayPaymentsByOrderId(Long orderId) {
        return gatewayPaymentRepository.findByOrderId(orderId);
    }

    public List<GatewayPayment> getAllGatewayPayments() {
        return gatewayPaymentRepository.findAll();
    }
}
