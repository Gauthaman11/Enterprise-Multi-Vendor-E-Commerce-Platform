package com.javaenterprise.payment.controller;

import com.javaenterprise.order.dto.OrderResponse;
import com.javaenterprise.payment.dto.PaymentResponse;
import com.javaenterprise.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customer/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/initiate")
    public ResponseEntity<PaymentResponse> initiatePayment(Authentication authentication) {
        return ResponseEntity.ok(paymentService.initiatePayment(authentication));
    }

    // ✅ Accepts Razorpay payload Map instead of individual parameters
    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, String> payload,
                                           @RequestParam Long addressId,
                                           Authentication authentication) {
        try {
            OrderResponse order = paymentService.verifyAndProcessPayment(payload, authentication, addressId);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage(),
                    "status", "FAILED"
            ));
        }
    }

    @GetMapping("/history")
    public ResponseEntity<List<PaymentResponse>> getPaymentHistory(Authentication authentication) {
        return ResponseEntity.ok(paymentService.getUserPayments(authentication));
    }
}