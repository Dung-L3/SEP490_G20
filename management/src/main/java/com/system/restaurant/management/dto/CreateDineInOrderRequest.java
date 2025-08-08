package com.system.restaurant.management.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class CreateDineInOrderRequest {
    @NotNull(message = "Table ID is required")
    private Integer tableId;
    private List<OrderItemRequest> items;
    private String notes;
}