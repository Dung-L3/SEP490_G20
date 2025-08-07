package com.system.restaurant.management.dto;

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
        @NotNull
        private Integer dishId;
        @NotNull
        private Integer quantity;

        @NotNull
        private BigDecimal unitPrice;
        private String notes;
    }
}