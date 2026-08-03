package com.javaenterprise.vendor.service;

import com.javaenterprise.order.entity.Order;
import com.javaenterprise.order.entity.OrderItem;
import com.javaenterprise.order.entity.OrderStatus;
import com.javaenterprise.order.repository.OrderItemRepository;
import com.javaenterprise.order.repository.OrderRepository;
import com.javaenterprise.user.entity.User;
import com.javaenterprise.user.repository.UserRepository;
import com.javaenterprise.vendor.dto.VendorOrderItemResponse;
import com.javaenterprise.vendor.dto.VendorOrderResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class VendorOrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;

    private User getVendor(Authentication authentication) {

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Vendor not found"));
    }

    /**
     * Get all vendor orders
     */
    public List<VendorOrderResponse> getOrders(Authentication authentication) {

        User vendor = getVendor(authentication);

        List<OrderItem> orderItems = orderItemRepository.findByProductVendor(vendor);

        Set<Order> orders = new LinkedHashSet<>();

        for (OrderItem item : orderItems) {
            orders.add(item.getOrder());
        }

        return orders.stream()
                .map(order -> mapToResponse(order, vendor))
                .toList();
    }

    /**
     * Get single order
     */
    public VendorOrderResponse getOrder(Long orderId,
                                        Authentication authentication) {

        User vendor = getVendor(authentication);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        boolean belongsToVendor = order.getItems().stream()
                .anyMatch(item ->
                        item.getProduct().getVendor().getId().equals(vendor.getId()));

        if (!belongsToVendor) {
            throw new RuntimeException("Access denied");
        }

        return mapToResponse(order, vendor);
    }

    /**
     * Confirm Order
     */
    @Transactional
    public VendorOrderResponse confirmOrder(Long orderId,
                                            Authentication authentication) {

        Order order = getAccessibleOrder(orderId, authentication);

        order.setStatus(OrderStatus.CONFIRMED);

        orderRepository.save(order);

        return mapToResponse(order, getVendor(authentication));
    }

    /**
     * Ship Order
     */
    @Transactional
    public VendorOrderResponse shipOrder(Long orderId,
                                         Authentication authentication) {

        Order order = getAccessibleOrder(orderId, authentication);

        order.setStatus(OrderStatus.SHIPPED);

        orderRepository.save(order);

        return mapToResponse(order, getVendor(authentication));
    }

    /**
     * Deliver Order
     */
    @Transactional
    public VendorOrderResponse deliverOrder(Long orderId,
                                            Authentication authentication) {

        Order order = getAccessibleOrder(orderId, authentication);

        order.setStatus(OrderStatus.DELIVERED);

        orderRepository.save(order);

        return mapToResponse(order, getVendor(authentication));
    }

    /**
     * Verify vendor owns at least one product in order
     */
    private Order getAccessibleOrder(Long orderId,
                                     Authentication authentication) {

        User vendor = getVendor(authentication);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        boolean allowed = order.getItems().stream()
                .anyMatch(item ->
                        item.getProduct().getVendor().getId().equals(vendor.getId()));

        if (!allowed) {
            throw new RuntimeException("Access denied");
        }

        return order;
    }

    /**
     * Entity -> DTO
     */
    private VendorOrderResponse mapToResponse(Order order,
                                              User vendor) {

        List<VendorOrderItemResponse> items = order.getItems()
                .stream()
                .filter(item ->
                        item.getProduct().getVendor().getId().equals(vendor.getId()))
                .map(item -> VendorOrderItemResponse.builder()
                        .productName(item.getProduct().getName())
                        .quantity(item.getQuantity())
                        .price(item.getPrice())
                        .subtotal(item.getSubtotal())
                        .build())
                .toList();

        return VendorOrderResponse.builder()
                .orderId(order.getId())
                .customerName(order.getUser().getName())
                .customerEmail(order.getUser().getEmail())
                .orderDate(order.getOrderDate())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .items(items)
                .build();
    }
}