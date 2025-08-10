package com.system.restaurant.management.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class ApplyPromotionResponse {
    private Integer orderId;
    private String promoCode;
    private BigDecimal subTotalBefore;
    private BigDecimal discountApplied;
    private BigDecimal finalTotalAfter;
}
