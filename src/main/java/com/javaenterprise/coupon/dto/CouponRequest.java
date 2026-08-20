package com.javaenterprise.coupon.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CouponRequest {
    @NotBlank private String code;
    private String discountType;
    @NotNull private BigDecimal discountValue;
    private BigDecimal minOrderAmount;
    private LocalDate expiryDate;
    private Integer usageLimit;
    private String description;
}