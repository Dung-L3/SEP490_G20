package com.system.restaurant.management.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderRequest {
    private String orderType;
    private String customerName;
    private String customerPhone;
    private Integer tableId;
    private Integer reservationId;
    private String notes;
    private List<OrderItemRequest> items;
    private BigDecimal discountAmount;
}