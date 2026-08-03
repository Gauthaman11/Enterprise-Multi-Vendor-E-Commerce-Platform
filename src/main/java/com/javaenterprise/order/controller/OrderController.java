package com.javaenterprise.order.controller;

import com.javaenterprise.order.dto.OrderResponse;
import com.javaenterprise.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/checkout")
    public OrderResponse checkout(Authentication authentication) {

        return orderService.checkout(authentication);
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