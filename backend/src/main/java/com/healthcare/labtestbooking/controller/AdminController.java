package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.entity.User;
import com.healthcare.labtestbooking.entity.enums.BookingStatus;
import com.healthcare.labtestbooking.entity.enums.UserRole;
import com.healthcare.labtestbooking.repository.BookingRepository;
import com.healthcare.labtestbooking.repository.UserRepository;
import com.healthcare.labtestbooking.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Slf4j
public class AdminController {

    private final DashboardService dashboardService;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {
        log.info("GET /api/admin/stats");
        Map<String, Object> stats = dashboardService.getAdminDashboardStats();
        return ResponseEntity.ok(ApiResponse.success("Stats fetched", stats));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Object>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String role) {
        log.info("GET /api/admin/users page={} size={} role={}", page, size, role);
        List<User> users;
        if (role != null && !role.isBlank()) {
            try {
                UserRole roleEnum = UserRole.valueOf(role.toUpperCase());
                users = userRepository.findByRole(roleEnum);
            } catch (IllegalArgumentException e) {
                users = userRepository.findAll();
            }
        } else {
            users = userRepository.findAll();
        }

        List<Map<String, Object>> result = users.stream().map(u -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", u.getId());
            m.put("name", u.getName());
            m.put("email", u.getEmail());
            m.put("role", u.getRole());
            m.put("status", Boolean.TRUE.equals(u.getIsActive()) ? "ACTIVE" : "INACTIVE");
            m.put("createdAt", u.getCreatedAt());
            m.put("joinDate", u.getCreatedAt());
            return m;
        }).toList();

        return ResponseEntity.ok(ApiResponse.success("Users fetched", result));
    }

    @PutMapping("/users/{userId}/role")
    public ResponseEntity<ApiResponse<String>> updateUserRole(
            @PathVariable Long userId,
            @RequestBody Map<String, String> body) {
        log.info("PUT /api/admin/users/{}/role", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        try {
            user.setRole(UserRole.valueOf(body.get("role").toUpperCase()));
            userRepository.save(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid role: " + body.get("role")));
        }
        return ResponseEntity.ok(ApiResponse.success("Role updated", "OK"));
    }

    @PutMapping("/users/{userId}/toggle-status")
    public ResponseEntity<ApiResponse<String>> toggleUserStatus(@PathVariable Long userId) {
        log.info("PUT /api/admin/users/{}/toggle-status", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setIsActive(!Boolean.TRUE.equals(user.getIsActive()));
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success(
                "Status toggled",
                Boolean.TRUE.equals(user.getIsActive()) ? "ACTIVE" : "INACTIVE"));
    }

    @GetMapping("/charts/{type}")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getChartData(
            @PathVariable String type) {
        log.info("GET /api/admin/charts/{}", type);
        List<Map<String, Object>> data = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            Map<String, Object> point = new HashMap<>();
            LocalDate date = LocalDate.now().minusDays(i);
            point.put("date", date.toString());
            point.put("value", (long) (Math.random() * 50 + 10));
            point.put("label", date.getDayOfWeek().toString().substring(0, 3));
            data.add(point);
        }
        return ResponseEntity.ok(ApiResponse.success("Chart data", data));
    }

    @GetMapping("/revenue")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getRevenue(
            @RequestParam(defaultValue = "week") String period) {
        log.info("GET /api/admin/revenue period={}", period);
        List<Map<String, Object>> data = new ArrayList<>();
        int days = "month".equals(period) ? 30 : 7;
        for (int i = days - 1; i >= 0; i--) {
            Map<String, Object> point = new HashMap<>();
            LocalDate date = LocalDate.now().minusDays(i);
            point.put("date", date.toString());
            point.put("value", (long) (Math.random() * 5000 + 1000));
            data.add(point);
        }
        return ResponseEntity.ok(ApiResponse.success("Revenue data", data));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAuditLogs() {
        log.info("GET /api/admin/audit-logs");
        return ResponseEntity.ok(ApiResponse.success("Audit logs", new ArrayList<>()));
    }

    @GetMapping("/bookings/trends")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getBookingTrends() {
        log.info("GET /api/admin/bookings/trends");
        List<Map<String, Object>> data = new ArrayList<>();
        for (BookingStatus status : BookingStatus.values()) {
            Map<String, Object> point = new HashMap<>();
            point.put("status", status.name());
            point.put("value", bookingRepository.countByStatus(status));
            data.add(point);
        }
        return ResponseEntity.ok(ApiResponse.success("Booking trends", data));
    }

    // ── Create staff account (TECHNICIAN or MEDICAL_OFFICER) ──────
    @PostMapping("/staff")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createStaff(
            @RequestBody Map<String, String> body) {
        log.info("POST /api/admin/staff - creating staff account");

        String name     = body.getOrDefault("name", "").trim();
        String email    = body.getOrDefault("email", "").trim().toLowerCase();
        String password = body.getOrDefault("password", "password123");
        String roleStr  = body.getOrDefault("role", "").trim().toUpperCase();
        String phone    = body.getOrDefault("phone", "").trim();

        if (name.isEmpty() || email.isEmpty()) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Name and email are required"));
        }
        if (!roleStr.equals("TECHNICIAN") && !roleStr.equals("MEDICAL_OFFICER")) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Role must be TECHNICIAN or MEDICAL_OFFICER"));
        }
        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Email already registered: " + email));
        }

        UserRole role = UserRole.valueOf(roleStr);
        User staff = new User();
        staff.setName(name);
        staff.setEmail(email);
        staff.setPassword(passwordEncoder.encode(password));
        staff.setRole(role);
        staff.setPhone(phone.isEmpty() ? "0000000000" : phone);
        staff.setIsActive(true);
        staff.setIsVerified(true);
        staff.setCreatedAt(LocalDateTime.now());
        staff.setUpdatedAt(LocalDateTime.now());
        User saved = userRepository.save(staff);

        Map<String, Object> result = new HashMap<>();
        result.put("id", saved.getId());
        result.put("name", saved.getName());
        result.put("email", saved.getEmail());
        result.put("role", saved.getRole().name());
        result.put("message", role.name() + " account created successfully");

        return ResponseEntity.ok(ApiResponse.success("Staff created", result));
    }

    // ── Delete staff account ──────────────────────────────────────
    @DeleteMapping("/staff/{userId}")
    public ResponseEntity<ApiResponse<String>> deleteStaff(@PathVariable Long userId) {
        log.info("DELETE /api/admin/staff/{}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        if (user.getRole() == UserRole.PATIENT) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Cannot delete patient accounts from here"));
        }
        if (user.getRole() == UserRole.ADMIN) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Cannot delete admin accounts"));
        }

        userRepository.delete(user);
        return ResponseEntity.ok(ApiResponse.success("Staff account deleted", "OK"));
    }

    // ── Get all staff (non-patient) ───────────────────────────────
    @GetMapping("/staff")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllStaff() {
        log.info("GET /api/admin/staff");
        List<UserRole> staffRoles = List.of(
            UserRole.TECHNICIAN, UserRole.MEDICAL_OFFICER, UserRole.ADMIN
        );
        List<User> staffUsers = userRepository.findAll().stream()
            .filter(u -> staffRoles.contains(u.getRole()))
            .collect(Collectors.toList());

        List<Map<String, Object>> result = staffUsers.stream().map(u -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", u.getId());
            m.put("name", u.getName());
            m.put("email", u.getEmail());
            m.put("role", u.getRole().name());
            m.put("phone", u.getPhone());
            m.put("isActive", u.getIsActive());
            m.put("createdAt", u.getCreatedAt());
            return m;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success("Staff list", result));
    }
}
