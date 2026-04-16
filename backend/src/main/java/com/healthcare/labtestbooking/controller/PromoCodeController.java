package com.healthcare.labtestbooking.controller;

import com.healthcare.labtestbooking.entity.Coupon;
import com.healthcare.labtestbooking.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/promo-codes")
@RequiredArgsConstructor
@CrossOrigin(originPatterns = "*")
public class PromoCodeController {

    private final CouponRepository couponRepository;

    @GetMapping("/featured")
    public ResponseEntity<?> getFeaturedPromoCodes(@RequestParam(defaultValue = "5") int limit) {
        List<Coupon> featured = couponRepository.findAll().stream()
                .filter(Coupon::getIsActive)
                .limit(limit)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", featured);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/available")
    public ResponseEntity<?> getAvailablePromoCodes() {
        List<Coupon> available = couponRepository.findAll().stream()
                .filter(Coupon::getIsActive)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", available);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/validate")
    public ResponseEntity<?> validatePromoCode(@RequestBody Map<String, Object> request) {
        String code = (String) request.get("code");
        
        return couponRepository.findByCouponCode(code)
                .map(coupon -> {
                    Map<String, Object> data = new HashMap<>();
                    data.put("code", coupon.getCouponCode());
                    data.put("discount_type", coupon.getDiscountType().name());
                    data.put("discount_value", coupon.getDiscountValue());
                    data.put("max_discount", coupon.getMaxDiscountAmount());
                    data.put("min_cart_value", coupon.getMinOrderAmount());
                    data.put("message", "Promo code applied!");

                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("data", data);
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", false);
                    Map<String, String> error = new HashMap<>();
                    error.put("message", "Invalid promo code");
                    response.put("error", error);
                    return ResponseEntity.ok(response);
                });
    }
}
