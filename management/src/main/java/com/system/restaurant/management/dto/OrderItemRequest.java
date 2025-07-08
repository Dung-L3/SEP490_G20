package com.system.restaurant.management.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class OrderItemRequest {
    private Integer menuItemId;
    private Integer quantity;
    private BigDecimal unitPrice;
    private String specialInstructions;
}