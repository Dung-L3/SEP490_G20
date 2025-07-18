package com.system.restaurant.management.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TableOrderRequest {
    @Valid
    @NotNull(message = "Item details are required")
    private OrderItemRequest item;

    private Integer tableId;
}