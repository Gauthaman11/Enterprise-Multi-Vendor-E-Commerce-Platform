package com.javaenterprise.coupon.service;

import com.javaenterprise.coupon.dto.*;
import com.javaenterprise.coupon.entity.Coupon;
import com.javaenterprise.coupon.entity.DiscountType;
import com.javaenterprise.coupon.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;

    // ---------- VALIDATION (used at checkout) ----------
    public CouponValidationResponse validate(String code, BigDecimal orderTotal) {
        if (code == null || code.isBlank())
            return invalid("No coupon applied");

        Coupon c = couponRepository.findByCodeIgnoreCase(code.trim()).orElse(null);
        if (c == null) return invalid("Invalid coupon code");
        if (!c.isActive()) return invalid("This coupon is no longer active");
        if (c.getExpiryDate() != null && c.getExpiryDate().isBefore(LocalDate.now()))
            return invalid("This coupon has expired");
        if (c.getMinOrderAmount() != null && orderTotal.compareTo(c.getMinOrderAmount()) < 0)
            return invalid("Add items worth ₹" + c.getMinOrderAmount().subtract(orderTotal) + " more to use " + c.getCode().toUpperCase());
        if (c.getUsageLimit() != null && c.getUsedCount() >= c.getUsageLimit())
            return invalid("Coupon usage limit reached");

        BigDecimal discount;
        if (c.getDiscountType() == DiscountType.PERCENTAGE) {
            discount = orderTotal.multiply(c.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        } else {
            discount = c.getDiscountValue().min(orderTotal); // never exceed total
        }

        return CouponValidationResponse.builder()
                .valid(true)
                .message("Coupon " + c.getCode().toUpperCase() + " applied! You save ₹" + discount)
                .code(c.getCode())
                .discountAmount(discount)
                .finalTotal(orderTotal.subtract(discount))
                .build();
    }

    @Transactional
    public void incrementUsage(String code) {
        couponRepository.findByCodeIgnoreCase(code).ifPresent(c -> {
            c.setUsedCount(c.getUsedCount() + 1);
            couponRepository.save(c);
        });
    }

    // ---------- ADMIN CRUD ----------
    public List<CouponResponse> getAll() {
        return couponRepository.findAll().stream().map(this::map).toList();
    }

    @Transactional
    public CouponResponse create(CouponRequest r) {
        if (couponRepository.existsByCodeIgnoreCase(r.getCode()))
            throw new RuntimeException("Coupon code already exists");
        Coupon c = Coupon.builder()
                .code(r.getCode().toUpperCase())
                .discountType(parseType(r.getDiscountType()))
                .discountValue(r.getDiscountValue())
                .minOrderAmount(r.getMinOrderAmount() != null ? r.getMinOrderAmount() : BigDecimal.ZERO)
                .expiryDate(r.getExpiryDate())
                .usageLimit(r.getUsageLimit())
                .usedCount(0)
                .active(true)
                .description(r.getDescription())
                .build();
        return map(couponRepository.save(c));
    }

    @Transactional
    public CouponResponse update(Long id, CouponRequest r) {
        Coupon c = couponRepository.findById(id).orElseThrow(() -> new RuntimeException("Coupon not found"));
        c.setCode(r.getCode().toUpperCase());
        c.setDiscountType(parseType(r.getDiscountType()));
        c.setDiscountValue(r.getDiscountValue());
        c.setMinOrderAmount(r.getMinOrderAmount() != null ? r.getMinOrderAmount() : BigDecimal.ZERO);
        c.setExpiryDate(r.getExpiryDate());
        c.setUsageLimit(r.getUsageLimit());
        c.setDescription(r.getDescription());
        return map(couponRepository.save(c));
    }

    @Transactional
    public CouponResponse toggle(Long id) {
        Coupon c = couponRepository.findById(id).orElseThrow(() -> new RuntimeException("Coupon not found"));
        c.setActive(!c.isActive());
        return map(couponRepository.save(c));
    }

    @Transactional
    public void delete(Long id) {
        couponRepository.deleteById(id);
    }

    private DiscountType parseType(String t) {
        return "FLAT".equalsIgnoreCase(t) ? DiscountType.FLAT : DiscountType.PERCENTAGE;
    }

    private CouponValidationResponse invalid(String msg) {
        return CouponValidationResponse.builder()
                .valid(false).message(msg)
                .discountAmount(BigDecimal.ZERO).build();
    }

    private CouponResponse map(Coupon c) {
        return CouponResponse.builder()
                .id(c.getId()).code(c.getCode())
                .discountType(c.getDiscountType().name())
                .discountValue(c.getDiscountValue())
                .minOrderAmount(c.getMinOrderAmount())
                .expiryDate(c.getExpiryDate())
                .usageLimit(c.getUsageLimit())
                .usedCount(c.getUsedCount())
                .active(c.isActive())
                .description(c.getDescription())
                .build();
    }
}