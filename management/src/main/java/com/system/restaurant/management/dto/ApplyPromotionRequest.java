package com.system.restaurant.management.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ApplyPromotionRequest {
    @NotNull
    private Integer orderId;

    @NotBlank
    private String promoCode;
}
