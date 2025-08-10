package com.system.restaurant.management.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PromotionRequestDto {
    @NotBlank
    private String promoCode;

    @NotBlank
    private String promoName;

    private String description;

    @DecimalMin(value = "0.0")
    @DecimalMax(value = "100.0")
    private BigDecimal discountPercent;

    @DecimalMin(value = "0.0")
    private BigDecimal discountAmount;

    @NotNull
    private LocalDate startDate;

    @NotNull
    private LocalDate endDate;

    @Min(0)
    private Integer usageLimit;

    @NotNull
    private Boolean isActive;
}
