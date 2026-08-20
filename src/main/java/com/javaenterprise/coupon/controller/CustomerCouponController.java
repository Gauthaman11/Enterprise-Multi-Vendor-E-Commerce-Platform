package com.javaenterprise.coupon.controller;

import com.javaenterprise.coupon.dto.CouponValidationResponse;
import com.javaenterprise.coupon.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/customer/coupons")
@RequiredArgsConstructor
public class CustomerCouponController {

    private final CouponService couponService;

    @GetMapping("/validate")
    public CouponValidationResponse validate(@RequestParam String code,
                                             @RequestParam BigDecimal orderTotal) {
        return couponService.validate(code, orderTotal);
    }
}