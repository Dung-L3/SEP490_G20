package com.system.restaurant.management.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class InvoiceResponseDTO {
    private Integer invoiceId;
    private String invoiceNumber;
    private Integer orderId;
    private String customerName;
    private String customerPhone;
    private BigDecimal subTotal;
    private BigDecimal discount;
    private BigDecimal finalTotal;
    private String paymentMethod;
    private LocalDateTime paymentDate;
    private String status;
    private List<InvoiceItemDTO> items;
}