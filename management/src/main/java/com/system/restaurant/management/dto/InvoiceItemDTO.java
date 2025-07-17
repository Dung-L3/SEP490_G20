package com.system.restaurant.management.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class InvoiceItemDTO {
    private String dishName;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal total;
}