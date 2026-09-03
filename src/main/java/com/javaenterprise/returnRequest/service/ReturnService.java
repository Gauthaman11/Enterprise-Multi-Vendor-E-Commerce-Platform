package com.javaenterprise.returnRequest.service;

import com.javaenterprise.order.entity.Order;
import com.javaenterprise.order.entity.OrderItem;
import com.javaenterprise.order.entity.OrderStatus;
import com.javaenterprise.order.repository.OrderItemRepository;
import com.javaenterprise.order.repository.OrderRepository;
import com.javaenterprise.payment.entity.Payment;
import com.javaenterprise.payment.entity.PaymentStatus;
import com.javaenterprise.payment.repository.PaymentRepository;
import com.javaenterprise.product.entity.Product;
import com.javaenterprise.product.repository.ProductRepository;
import com.javaenterprise.returnRequest.entity.ReturnRequest;
import com.javaenterprise.returnRequest.entity.ReturnStatus;
import com.javaenterprise.returnRequest.repository.ReturnRequestRepository;
import com.javaenterprise.user.entity.User;
import com.javaenterprise.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReturnService {

    private final ReturnRequestRepository returnRepo;
    private final OrderRepository orderRepo;
    private final OrderItemRepository orderItemRepo;
    private final UserRepository userRepo;
    private final PaymentRepository paymentRepo;
    private final ProductRepository productRepo;

    // 1. CUSTOMER REQUESTS RETURN
    @Transactional
    public ReturnRequest requestReturn(Long orderId, Long orderItemId, String reason, Authentication auth) {
        User user = userRepo.findByEmail(auth.getName()).orElseThrow(() -> new RuntimeException("User not found"));
        Order order = orderRepo.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));

        // VALIDATION 1: Order belongs to customer
        if (!order.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized: Order does not belong to you.");
        }

        // VALIDATION 2: Order must be DELIVERED
        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new RuntimeException("Returns can only be requested for delivered orders.");
        }

        // VALIDATION 3: Prevent duplicate returns
        if (returnRepo.findByOrderItemId(orderItemId).isPresent()) {
            throw new RuntimeException("A return request already exists for this item.");
        }

        OrderItem item = orderItemRepo.findById(orderItemId).orElseThrow(() -> new RuntimeException("Order item not found"));

        ReturnRequest req = ReturnRequest.builder()
                .orderId(orderId)
                .orderItemId(orderItemId)
                .userId(user.getId())
                .customerName(user.getName())          // 🆕 Save customer name
                .productName(item.getProduct().getName())
                .reason(reason)
                .status(ReturnStatus.REQUESTED)
                .refundAmount(item.getSubtotal()) // Refund the subtotal of that specific item
                .build();

        return returnRepo.save(req);
    }

    // 2. GET CUSTOMER'S RETURNS (This was the missing method!)
    public List<ReturnRequest> getMyReturns(Authentication auth) {
        User user = userRepo.findByEmail(auth.getName()).orElseThrow(() -> new RuntimeException("User not found"));
        return returnRepo.findByUserId(user.getId());
    }

    // 3. ADMIN GETS ALL REQUESTS
    public List<ReturnRequest> getAllReturns() {
        return returnRepo.findAllByOrderByCreatedAtDesc();
    }

    // 4. ADMIN APPROVES / REJECTS / MARKS RECEIVED
    @Transactional
    public ReturnRequest updateStatus(Long returnId, ReturnStatus newStatus, boolean restock) {
        ReturnRequest req = returnRepo.findById(returnId).orElseThrow(() -> new RuntimeException("Return request not found"));

        if (newStatus == ReturnStatus.RECEIVED) {
            req.setRestock(restock);
        }

        req.setStatus(newStatus);
        return returnRepo.save(req);
    }

    // 5. PROCESS REFUND & UPDATE INVENTORY (The Final Step)
    @Transactional
    public void processRefund(Long returnId) {
        ReturnRequest req = returnRepo.findById(returnId).orElseThrow(() -> new RuntimeException("Return request not found"));

        if (req.getStatus() != ReturnStatus.RECEIVED) {
            throw new RuntimeException("Item must be marked as RECEIVED before processing a refund.");
        }

        // A. Update Inventory (Only if restock is true and item is usable)
        if (req.isRestock()) {
            OrderItem item = orderItemRepo.findById(req.getOrderItemId()).orElseThrow();
            Product product = item.getProduct();
            // Add back to main product stock
            product.setStock(product.getStock() + item.getQuantity());
            productRepo.save(product);
        }

        // B. Update Payment Status
        Payment payment = paymentRepo.findByOrderId(req.getOrderId()).orElse(null);
        if (payment != null) {
            payment.setStatus(PaymentStatus.REFUNDED);
            paymentRepo.save(payment);
        }

        // C. Update Main Order Status
        Order order = orderRepo.findById(req.getOrderId()).orElseThrow();
        order.setStatus(OrderStatus.REFUNDED);
        orderRepo.save(order);

        // D. Finalize Return Request
        req.setStatus(ReturnStatus.REFUNDED);
        returnRepo.save(req);
    }
}