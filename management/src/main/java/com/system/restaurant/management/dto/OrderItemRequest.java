package com.system.restaurant.management.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class OrderItemRequest {
    private Integer dishId;
    private Integer comboId;
    private String name;
    private Boolean isCombo;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    private BigDecimal unitPrice;
    private String status;
    private String notes;
}