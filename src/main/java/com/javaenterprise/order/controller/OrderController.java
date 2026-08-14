package com.javaenterprise.order.controller;

import com.javaenterprise.order.dto.OrderResponse;
import com.javaenterprise.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer/orders")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    // ✅ FIXED CODE
    @PostMapping("/checkout")
    public ResponseEntity<OrderResponse> checkout(@RequestParam Long addressId,
                                                  Authentication authentication) {
        return ResponseEntity.ok(orderService.checkout(authentication, addressId));
    }

    @GetMapping
    public List<OrderResponse> getOrders(Authentication authentication) {
        return orderService.getOrders(authentication);
    }

    @GetMapping("/{id}")
    public OrderResponse getOrder(@PathVariable Long id,
                                  Authentication authentication) {
        return orderService.getOrder(id, authentication);
    }

    @PutMapping("/{id}/cancel")
    public void cancelOrder(@PathVariable Long id,
                            Authentication authentication) {
        orderService.cancelOrder(id, authentication);
    }
}