package com.system.restaurant.management.dto;

import lombok.Data;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

@Data
public class CreateComboRequest {
    @NotBlank(message = "Combo name is required")
    @Size(max = 100, message = "Combo name must not exceed 100 characters")
    private String comboName;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    private BigDecimal price;

    @Size(max = 255, message = "Description must not exceed 255 characters")
    private String description;

    @NotEmpty(message = "Combo must have at least one item")
    private List<ComboItemRequest> comboItems;
}