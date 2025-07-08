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
public class PurchaseHistoryResponse {
    private String customerPhone;
    private String customerName;
    private Integer totalOrders;
    private BigDecimal totalSpent;
    private List<PurchaseHistoryDto> purchaseHistory;
}