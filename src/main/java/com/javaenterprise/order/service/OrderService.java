package com.javaenterprise.order.service;

import com.javaenterprise.cart.entity.Cart;
import com.javaenterprise.cart.repository.CartRepository;
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
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    @Transactional
    public OrderResponse checkout(Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow();

        List<Cart> cartItems = cartRepository.findByUser(user);

        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        Order order = Order.builder()
                .user(user)
                .status(OrderStatus.PENDING)
                .build();

        List<OrderItemResponse> responses = new ArrayList<>();

        BigDecimal total = BigDecimal.ZERO;

        for (Cart cart : cartItems) {

            Product product = cart.getProduct();

            if (product.getStock() < cart.getQuantity()) {
                throw new RuntimeException(
                        product.getName() + " has insufficient stock");
            }

            BigDecimal subtotal =
                    product.getPrice()
                            .multiply(BigDecimal.valueOf(cart.getQuantity()));

            OrderItem item = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(cart.getQuantity())
                    .price(product.getPrice())
                    .subtotal(subtotal)
                    .build();

            order.getItems().add(item);

            product.setStock(product.getStock() - cart.getQuantity());

            productRepository.save(product);

            total = total.add(subtotal);

            responses.add(
                    OrderItemResponse.builder()
                            .productName(product.getName())
                            .price(product.getPrice())
                            .quantity(cart.getQuantity())
                            .subtotal(subtotal)
                            .build()
            );
        }

        order.setTotalAmount(total);

        orderRepository.save(order);

        cartRepository.deleteByUser(user);

        return OrderResponse.builder()
                .orderId(order.getId())
                .orderDate(order.getOrderDate())
                .status(order.getStatus().name())
                .totalAmount(total)
                .items(responses)
                .build();
    }

    public List<OrderResponse> getOrders(Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow();

        return orderRepository.findByUser(user)
                .stream()
                .map(order -> OrderResponse.builder()
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
                        .build())
                .toList();
    }
    public OrderResponse getOrder(Long id, Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow();

        Order order = orderRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Order not found"));

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
                .build();
    }
    @Transactional
    public void cancelOrder(Long id, Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow();

        Order order = orderRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new RuntimeException("Only pending orders can be cancelled");
        }

        order.setStatus(OrderStatus.CANCELLED);

        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            product.setStock(product.getStock() + item.getQuantity());
            productRepository.save(product);
        }

        orderRepository.save(order);
    }
}