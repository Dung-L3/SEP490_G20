package com.system.restaurant.management.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
public class CreateTakeawayOrderRequest {
    @NotNull private String customerName;
    @NotNull private String phone;
    private String notes;

    @NotNull private List<OrderItemDto> items;

    @Data
    @NoArgsConstructor @AllArgsConstructor
    public static class OrderItemDto {
        private Integer dishId;
        private Integer comboId;
        @NotNull private Integer quantity;
        private BigDecimal unitPrice;
        private String notes;

        @AssertTrue(message = "Mỗi item phải có dishId hoặc comboId")
        public boolean hasDishOrCombo() {
            return dishId != null || comboId != null;
        }
    }
}