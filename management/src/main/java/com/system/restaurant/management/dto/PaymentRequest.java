package com.system.restaurant.management.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequest {
    private Integer methodId;
    private BigDecimal amount;
    private Integer issuedBy;
    private String notes;
    private String paymentMethod;
}