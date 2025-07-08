package com.system.restaurant.management.dto;

import lombok.*;
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