package com.javaenterprise.payment.service;

import com.javaenterprise.cart.dto.CartSummaryResponse;
import com.javaenterprise.cart.service.CartService;
import com.javaenterprise.order.dto.OrderResponse;
import com.javaenterprise.order.service.OrderService;
import com.javaenterprise.payment.dto.PaymentResponse;
import com.javaenterprise.payment.entity.Payment;
import com.javaenterprise.payment.entity.PaymentStatus;
import com.javaenterprise.payment.repository.PaymentRepository;
import com.javaenterprise.user.entity.User;
import com.javaenterprise.user.repository.UserRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final CartService cartService;
    private final OrderService orderService;
    private final UserRepository userRepository;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    @Transactional
    public PaymentResponse initiatePayment(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        CartSummaryResponse cart = cartService.getCart(authentication);
        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        try {
            // Razorpay requires amount in paise
            int amountInPaise = cart.getTotalAmount().multiply(BigDecimal.valueOf(100)).intValue();

            RazorpayClient razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "txn_" + user.getId() + "_" + System.currentTimeMillis());

            Order razorpayOrder = razorpayClient.orders.create(orderRequest);

            Payment payment = Payment.builder()
                    .transactionId(razorpayOrder.get("receipt"))
                    .razorpayOrderId(razorpayOrder.get("id"))
                    .amount(cart.getTotalAmount())
                    .status(PaymentStatus.INITIATED)
                    .user(user)
                    .build();

            Payment saved = paymentRepository.save(payment);

            return PaymentResponse.builder()
                    .paymentId(saved.getId())
                    .razorpayOrderId(razorpayOrder.get("id"))
                    .amountInPaise(amountInPaise) // Frontend needs this
                    .amount(saved.getAmount())
                    .keyId(razorpayKeyId) // Frontend needs public key
                    .status(saved.getStatus().name())
                    .build();

        } catch (RazorpayException e) {
            throw new RuntimeException("Failed to create Razorpay order: " + e.getMessage());
        }
    }

    @Transactional
    public OrderResponse verifyAndProcessPayment(Map<String, String> payload, Authentication authentication,Long addressId) {
        String razorpayOrderId = payload.get("razorpay_order_id");
        String razorpayPaymentId = payload.get("razorpay_payment_id");
        String razorpaySignature = payload.get("razorpay_signature");

        Payment payment = paymentRepository.findByRazorpayOrderId(razorpayOrderId)
                .orElseThrow(() -> new RuntimeException("Payment record not found"));

        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", razorpayOrderId);
            options.put("razorpay_payment_id", razorpayPaymentId);
            options.put("razorpay_signature", razorpaySignature);

            boolean isSignatureValid = Utils.verifyPaymentSignature(options, razorpayKeySecret);

            if (isSignatureValid) {
                payment.setStatus(PaymentStatus.SUCCESS);
                payment.setRazorpayPaymentId(razorpayPaymentId);
                payment.setRazorpaySignature(razorpaySignature);
                payment.setPaymentMethod("RAZORPAY");
                paymentRepository.save(payment);

                // Triggers OrderService.checkout() -> reduces stock -> clears cart
                return orderService.checkout(authentication, addressId);
            } else {
                payment.setStatus(PaymentStatus.FAILED);
                payment.setFailureReason("Invalid Razorpay Signature");
                paymentRepository.save(payment);
                throw new RuntimeException("Payment verification failed. Invalid signature.");
            }
        } catch (RazorpayException e) {
            throw new RuntimeException("Razorpay verification error: " + e.getMessage());
        }
    }

    // ✅ ADDED THIS METHOD TO FIX THE "CANNOT FIND SYMBOL" ERROR
    public List<PaymentResponse> getUserPayments(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return paymentRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(p -> PaymentResponse.builder()
                        .paymentId(p.getId())
                        .transactionId(p.getTransactionId())
                        .razorpayOrderId(p.getRazorpayOrderId())
                        .amount(p.getAmount())
                        .status(p.getStatus().name())
                        .paymentMethod(p.getPaymentMethod())
                        .build())
                .toList();
    }
    @Transactional
    public OrderResponse placeCodOrder(Long addressId, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        CartSummaryResponse cart = cartService.getCart(authentication);
        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        // Create a COD payment record (no Razorpay involved)
        Payment payment = Payment.builder()
                .transactionId("COD_" + user.getId() + "_" + System.currentTimeMillis())
                .amount(cart.getTotalAmount())
                .status(PaymentStatus.SUCCESS) // Marked successful — vendor will collect cash on delivery
                .paymentMethod("COD")
                .user(user)
                .build();

        paymentRepository.save(payment);

        // Create the order (same as Razorpay success flow)
        return orderService.checkout(authentication, addressId);
    }
}