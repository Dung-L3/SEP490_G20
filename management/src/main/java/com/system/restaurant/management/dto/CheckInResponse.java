package com.system.restaurant.management.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckInResponse {
    private Integer orderId;
    private Integer tableId;
    private String tableName;
    private String customerName;
    private String phone;
    private String orderType;
    private BigDecimal finalTotal;
    private Integer statusId;
    private LocalDateTime createdAt;
    private String message;
}