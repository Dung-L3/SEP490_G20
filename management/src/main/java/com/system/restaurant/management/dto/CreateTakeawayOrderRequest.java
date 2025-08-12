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
    @NotNull
    private String customerName;
    @NotNull
    private String phone;

    private String notes;

    @NotNull
    private List<OrderItemDto> items;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemDto {
        private Integer dishId;     // 1 trong 2
        private Integer comboId;    // 1 trong 2

        @NotNull @Min(1)
        private Integer quantity;

        private BigDecimal unitPrice;
        private String notes;

        @AssertTrue(message = "Exactly one of dishId or comboId must be provided")
        public boolean isDishXorCombo() {
            return (dishId != null) ^ (comboId != null);
        }
    }

    @AssertTrue(message = "Items must not be empty")
    public boolean isItemsNotEmpty() {
        return items != null && !items.isEmpty();
    }
}
