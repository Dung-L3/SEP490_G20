package com.system.restaurant.management.dto;

import lombok.Data;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

@Data
public class UpdateComboRequest {
    @Size(max = 100, message = "Combo name must not exceed 100 characters")
    private String comboName;

    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    private BigDecimal price;

    @Size(max = 255, message = "Description must not exceed 255 characters")
    private String description;

    private List<ComboItemRequest> comboItems;
}