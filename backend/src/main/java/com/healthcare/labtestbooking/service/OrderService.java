package com.healthcare.labtestbooking.service;

import com.healthcare.labtestbooking.entity.LabTest;
import com.healthcare.labtestbooking.entity.Order;
import com.healthcare.labtestbooking.entity.OrderStatusHistory;
import com.healthcare.labtestbooking.entity.TestPackage;
import com.healthcare.labtestbooking.entity.User;
import com.healthcare.labtestbooking.entity.enums.OrderStatus;
import com.healthcare.labtestbooking.repository.LabTestRepository;
import com.healthcare.labtestbooking.repository.OrderRepository;
import com.healthcare.labtestbooking.repository.OrderStatusHistoryRepository;
import com.healthcare.labtestbooking.repository.ReportRepository;
import com.healthcare.labtestbooking.repository.TestPackageRepository;
import com.healthcare.labtestbooking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
// Notification service disabled - email functionality removed

import java.time.LocalDateTime;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private static final Map<OrderStatus, EnumSet<OrderStatus>> ALLOWED_TRANSITIONS = buildTransitions();

    private final OrderRepository orderRepository;
    private final OrderStatusHistoryRepository historyRepository;
    private final UserRepository userRepository;
    private final LabTestRepository labTestRepository;
    private final TestPackageRepository testPackageRepository;
    private final ReportRepository reportRepository;
    // private final NotificationService notificationService;  // Email notifications disabled

    @Transactional
    public Order createOrder(Long userId, Long testId, Long packageId, String paymentInfo, String slotInfo) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        LabTest test = null;
        TestPackage testPackage = null;
        if (testId != null) {
            test = labTestRepository.findById(testId)
                .orElseThrow(() -> new RuntimeException("Test not found: " + testId));
        }
        if (packageId != null) {
            testPackage = testPackageRepository.findById(packageId)
                .orElseThrow(() -> new RuntimeException("Package not found: " + packageId));
        }
        if (test == null && testPackage == null) {
            throw new RuntimeException("Either testId or packageId must be provided");
        }

        Order order = Order.builder()
            .user(user)
            .test(test)
            .testPackage(testPackage)
            .paymentInfo(paymentInfo)
            .slotInfo(slotInfo)
            .status(OrderStatus.PENDING)
            .lastStatusChangedAt(LocalDateTime.now())
            .build();

        Order saved = orderRepository.save(order);
        recordHistory(saved, OrderStatus.PENDING, "Order created", "system");
        notifyStatusChange(saved, OrderStatus.PENDING);
        return saved;
    }

    @Transactional
    public Order updateStatus(Long orderId, OrderStatus newStatus, String note, String changedBy) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        validateTransition(order.getStatus(), newStatus);
        order.setStatus(newStatus);
        order.setLastStatusChangedAt(LocalDateTime.now());
        Order saved = orderRepository.save(order);

        recordHistory(saved, newStatus, note, changedBy);
        notifyStatusChange(saved, newStatus);
        return saved;
    }

    @Transactional
    public Order cancelOrder(Long orderId, String reason, String changedBy) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        OrderStatus current = order.getStatus();
        if (current == OrderStatus.DELIVERED || current == OrderStatus.REFUND_PROCESSED) {
            throw new RuntimeException("Order cannot be cancelled at status: " + current);
        }

        return updateStatus(orderId, OrderStatus.CANCELLATION_REQUESTED, reason, changedBy);
    }

    @Transactional(readOnly = true)
    public List<OrderStatusHistory> getOrderTimeline(Long orderId) {
        return historyRepository.findByOrderIdOrderByChangedAtAsc(orderId);
    }

    @Transactional(readOnly = true)
    public Order getOrder(Long orderId) {
        return orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
    }

    private void validateTransition(OrderStatus current, OrderStatus target) {
        EnumSet<OrderStatus> allowed = ALLOWED_TRANSITIONS.get(current);
        if (allowed == null || !allowed.contains(target)) {
            throw new RuntimeException("Invalid status transition: " + current + " -> " + target);
        }
    }

    private void recordHistory(Order order, OrderStatus status, String note, String changedBy) {
        OrderStatusHistory history = OrderStatusHistory.builder()
            .order(order)
            .status(status)
            .note(note)
            .changedBy(changedBy)
            .build();
        historyRepository.save(history);
    }

    private void notifyStatusChange(Order order, OrderStatus status) {
        log.info("Order {} status changed to {}", order.getId(), status);
        // Notifications disabled - email functionality removed
        // switch (status) {
        //     case PAYMENT_COMPLETED -> notificationService.sendOrderConfirmed(order);
        //     case TECHNICIAN_ASSIGNED -> notificationService.sendTechnicianAssigned(order);
        //     case SAMPLE_COLLECTED -> notificationService.sendSampleCollected(order);
        //     case REPORT_READY -> notificationService.sendReportReady(
        //             order,
        //             reportRepository.findByOrderId(order.getId()).orElse(null)
        //     );
        //     default -> {
        //         // No notification
        //     }
        // }
    }

    private static Map<OrderStatus, EnumSet<OrderStatus>> buildTransitions() {
        Map<OrderStatus, EnumSet<OrderStatus>> map = new EnumMap<>(OrderStatus.class);
        map.put(OrderStatus.PENDING, EnumSet.of(OrderStatus.PAYMENT_PENDING, OrderStatus.CANCELLATION_REQUESTED));
        map.put(OrderStatus.PAYMENT_PENDING, EnumSet.of(OrderStatus.PAYMENT_COMPLETED, OrderStatus.CANCELLATION_REQUESTED));
        map.put(OrderStatus.PAYMENT_COMPLETED, EnumSet.of(OrderStatus.TECHNICIAN_ASSIGNED, OrderStatus.CANCELLATION_REQUESTED));
        map.put(OrderStatus.TECHNICIAN_ASSIGNED, EnumSet.of(OrderStatus.SAMPLE_COLLECTED, OrderStatus.CANCELLATION_REQUESTED));
        map.put(OrderStatus.SAMPLE_COLLECTED, EnumSet.of(OrderStatus.SAMPLE_RECEIVED_AT_LAB));
        map.put(OrderStatus.SAMPLE_RECEIVED_AT_LAB, EnumSet.of(OrderStatus.PROCESSING));
        map.put(OrderStatus.PROCESSING, EnumSet.of(OrderStatus.REPORT_GENERATED));
        map.put(OrderStatus.REPORT_GENERATED, EnumSet.of(OrderStatus.REPORT_READY));
        map.put(OrderStatus.REPORT_READY, EnumSet.of(OrderStatus.DELIVERED));
        map.put(OrderStatus.CANCELLATION_REQUESTED, EnumSet.of(OrderStatus.CANCELLATION_CONFIRMED));
        map.put(OrderStatus.CANCELLATION_CONFIRMED, EnumSet.of(OrderStatus.REFUND_PROCESSED));
        map.put(OrderStatus.DELIVERED, EnumSet.noneOf(OrderStatus.class));
        map.put(OrderStatus.REFUND_PROCESSED, EnumSet.noneOf(OrderStatus.class));
        return map;
    }
}
