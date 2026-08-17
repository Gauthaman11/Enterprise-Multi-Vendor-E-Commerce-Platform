package com.javaenterprise.order.service;

import com.javaenterprise.cart.entity.Cart;
import com.javaenterprise.cart.repository.CartRepository;
import com.javaenterprise.customer.entity.Address;
import com.javaenterprise.customer.repository.AddressRepository;
import com.javaenterprise.order.dto.OrderItemResponse;
import com.javaenterprise.order.dto.OrderResponse;
import com.javaenterprise.order.entity.Order;
import com.javaenterprise.order.entity.OrderItem;
import com.javaenterprise.order.entity.OrderStatus;
import com.javaenterprise.order.repository.OrderRepository;
import com.javaenterprise.product.entity.Product;
import com.javaenterprise.product.repository.ProductRepository;
import com.javaenterprise.user.entity.User;
import com.javaenterprise.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final AddressRepository addressRepository;

    public List<OrderResponse> getOrders(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();

        return orderRepository.findByUser(user)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public OrderResponse getOrder(Long id, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();

        Order order = orderRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        return mapToResponse(order);
    }

    @Transactional
    public void cancelOrder(Long id, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();

        Order order = orderRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new RuntimeException("Only pending orders can be cancelled");
        }

        order.setStatus(OrderStatus.CANCELLED);

        // Restore stock when cancelled
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            product.setStock(product.getStock() + item.getQuantity());
            productRepository.save(product);
        }

        orderRepository.save(order);
    }

    @Transactional
    public OrderResponse checkout(Authentication authentication, Long addressId) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Cart> cartItems = cartRepository.findByUser(user);
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        // ✅ Get shipping address
        Address shippingAddress = addressRepository.findByIdAndUser(addressId, user)
                .orElseThrow(() -> new RuntimeException("Shipping address not found"));

        Order order = Order.builder()
                .user(user)
                .orderDate(LocalDateTime.now())
                .status(OrderStatus.PENDING)
                .items(new ArrayList<>())
                .shippingAddress(shippingAddress) // ✅ Store address with order
                .build();

        BigDecimal orderTotal = BigDecimal.ZERO;

        for (Cart cartItem : cartItems) {
            Product product = cartItem.getProduct();

            if (product.getStock() < cartItem.getQuantity()) {
                throw new RuntimeException("Insufficient stock for: " + product.getName());
            }

            BigDecimal originalPrice = product.getPrice();
            BigDecimal finalPrice = originalPrice;
            if (product.getDiscountPercentage() != null && product.getDiscountPercentage() > 0) {
                BigDecimal discountAmount = originalPrice
                        .multiply(BigDecimal.valueOf(product.getDiscountPercentage()))
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                finalPrice = originalPrice.subtract(discountAmount);
            }

            BigDecimal itemSubtotal = finalPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            orderTotal = orderTotal.add(itemSubtotal);

            product.setStock(product.getStock() - cartItem.getQuantity());
            productRepository.save(product);

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(cartItem.getQuantity())
                    .price(finalPrice)
                    .subtotal(itemSubtotal)
                    .build();

            order.getItems().add(orderItem);
        }

        order.setTotalAmount(orderTotal);
        Order savedOrder = orderRepository.save(order);
        cartRepository.deleteAll(cartItems);

        return mapToResponse(savedOrder);
    }


    private OrderResponse mapToResponse(Order order) {
        return OrderResponse.builder()
                .orderId(order.getId())
                .orderDate(order.getOrderDate())
                .status(order.getStatus().name())
                .totalAmount(order.getTotalAmount())
                .items(order.getItems().stream()
                        .map(item -> OrderItemResponse.builder()
                                .productName(item.getProduct().getName())
                                .price(item.getPrice())
                                .quantity(item.getQuantity())
                                .subtotal(item.getSubtotal())
                                .build())
                        .toList())
                .shippingAddress(order.getShippingAddress() != null
                        ? toAddressResponse(order.getShippingAddress())
                        : null)
                .build();
    }
    @Transactional
    public void requestReturn(Long id, String reason, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        Order order = orderRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Customers can only request returns for DELIVERED orders
        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new RuntimeException("Returns can only be requested for delivered orders");
        }

        order.setStatus(OrderStatus.RETURN_REQUESTED);
        order.setReturnReason(reason);
        orderRepository.save(order);
    }
    private com.javaenterprise.customer.dto.AddressResponse toAddressResponse(Address address) {
        return com.javaenterprise.customer.dto.AddressResponse.builder()
                .id(address.getId())
                .fullName(address.getFullName())
                .phone(address.getPhone())
                .addressLine(address.getAddressLine())
                .city(address.getCity())
                .state(address.getState())
                .postalCode(address.getPostalCode())
                .country(address.getCountry())
                .defaultAddress(address.isDefaultAddress())
                .build();
    }
}