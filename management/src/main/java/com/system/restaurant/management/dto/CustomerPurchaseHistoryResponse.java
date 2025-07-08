package com.system.restaurant.management.dto;

import com.system.restaurant.management.entity.Order;
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
public class CustomerPurchaseHistoryResponse {
    private String phone;
    private String customerName;
    private List<Order> orders;
    private BigDecimal totalSpent;
    private Integer totalOrders;
}