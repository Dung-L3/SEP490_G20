package com.system.restaurant.management.dto;

import lombok.Data;
import jakarta.validation.constraints.*;

@Data
public class ComboItemRequest {
    @NotNull(message = "Dish ID is required")
    private Integer dishId;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;
}