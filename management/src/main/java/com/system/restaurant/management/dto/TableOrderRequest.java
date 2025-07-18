package com.system.restaurant.management.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TableOrderRequest {
    @NotNull(message = "Table ID is required")
    private Integer tableId;

    @NotNull(message = "Order item is required")
    private OrderItemRequest item;
}