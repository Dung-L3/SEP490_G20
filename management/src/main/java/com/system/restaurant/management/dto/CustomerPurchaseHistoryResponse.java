package com.system.restaurant.management.dto;

import com.system.restaurant.management.entity.Order;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class CustomerPurchaseHistoryResponse {
    private String phone;
    private String customerName;
    private List<Order> orders;
    private BigDecimal totalSpent;
    private Integer totalOrders;
}