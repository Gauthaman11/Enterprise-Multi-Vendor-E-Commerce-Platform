package com.javaenterprise.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    // Existing Method
    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("ShopStack - Password Reset Request");
        message.setText("Click the link below to reset your password:\n\n" +
                "http://localhost:5173/reset-password?token=" + resetToken + "\n\n" +
                "This link will expire in 30 minutes. If you did not request this, please ignore this email.");
        mailSender.send(message);
    }

    // 1. Order Placed
    @Async
    public void sendOrderPlacedEmail(String toEmail, String orderId, Double totalAmount) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("ShopStack - Order Placed Successfully");
        message.setText("Hello,\n\nYour order has been successfully placed.\n\n" +
                "Order ID: " + orderId + "\n" +
                "Total Amount: $" + totalAmount + "\n\n" +
                "We will notify you once your order is shipped.\n\nThank you for shopping with ShopStack!");
        mailSender.send(message);
        log.info("✅ Order placed email sent to {}", toEmail);
    }

    // 2a. Payment Successful
    @Async
    public void sendPaymentSuccessEmail(String toEmail, String orderId, String paymentId, Double amount) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("ShopStack - Payment Successful");
        message.setText("Hello,\n\nYour payment was successful.\n\n" +
                "Order ID: " + orderId + "\n" +
                "Payment ID: " + paymentId + "\n" +
                "Amount Paid: $" + amount + "\n\nThank you!");
        mailSender.send(message);
        log.info("✅ Payment success email sent to {}", toEmail);
    }

    // 2b. Payment Failed
    @Async
    public void sendPaymentFailedEmail(String toEmail, String orderId) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("ShopStack - Payment Failed");
        message.setText("Hello,\n\nWe were unable to process your payment for Order ID: " + orderId + ".\n\n" +
                "Please try again or use a different payment method.");
        mailSender.send(message);
        log.info("⚠️ Payment failed email sent to {}", toEmail);
    }

    // 3. Order Shipped
    @Async
    public void sendOrderShippedEmail(String toEmail, String orderId, String trackingInfo) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("ShopStack - Your Order Has Been Shipped!");
        message.setText("Hello,\n\nGreat news! Your order has been shipped.\n\n" +
                "Order ID: " + orderId + "\n" +
                "Tracking Info: " + (trackingInfo != null ? trackingInfo : "Available in your dashboard") + "\n\n" +
                "Thank you for shopping with ShopStack!");
        mailSender.send(message);
        log.info("✅ Order shipped email sent to {}", toEmail);
    }

    // 4. Order Delivered
    @Async
    public void sendOrderDeliveredEmail(String toEmail, String orderId) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("ShopStack - Your Order Has Been Delivered!");
        message.setText("Hello,\n\nYour order has been successfully delivered.\n\n" +
                "Order ID: " + orderId + "\n\n" +
                "We hope you enjoy your purchase! Please consider leaving a review.");
        mailSender.send(message);
        log.info("✅ Order delivered email sent to {}", toEmail);
    }

    // 5. Refund Completed
    @Async
    public void sendRefundCompletedEmail(String toEmail, String orderId, Double refundAmount) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("ShopStack - Refund Completed");
        message.setText("Hello,\n\nYour refund has been successfully processed.\n\n" +
                "Order ID: " + orderId + "\n" +
                "Refund Amount: $" + refundAmount + "\n\n" +
                "Please allow 3-5 business days for the amount to reflect in your account.");
        mailSender.send(message);
        log.info("✅ Refund completed email sent to {}", toEmail);
    }
}
