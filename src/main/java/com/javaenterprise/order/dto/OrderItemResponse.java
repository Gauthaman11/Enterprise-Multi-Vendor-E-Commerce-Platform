package com.javaenterprise.order.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class OrderItemResponse {

    private String productName;

    private Integer quantity;

    private BigDecimal price;

    private BigDecimal subtotal;
}