package com.system.restaurant.management.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class PaymentRequest {
    private Integer methodId;
    private BigDecimal amount;
    private String notes;
}