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
public class CompletePaymentResponse {
    private Integer orderId;
    private Integer paymentRecordId;
    private String invoiceNumber;
    private BigDecimal paidAmount;
    private BigDecimal totalAmount;
    private LocalDateTime paymentDate;
    private String paymentMethod;
    private String status;
    private String message;
}