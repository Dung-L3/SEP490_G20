package com.system.restaurant.management.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderRequestDto {
    private Integer orderId;
    private LocalDateTime createdAt;
    private String status;
    private String orderType;
    private String customerName;
    private String phone;
    private BigDecimal subTotal;
    private BigDecimal discountAmount;
    private BigDecimal finalTotal;
    private Integer tableId;
    private String notes;
}