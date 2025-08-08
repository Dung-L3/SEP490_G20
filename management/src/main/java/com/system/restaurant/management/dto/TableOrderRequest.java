package com.system.restaurant.management.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class TableOrderRequest {
    @NotNull(message = "Table ID is required")
    private Integer tableId;
    private List<OrderItem> items;
    private String orderType = "DINE_IN";

    @Data
    public static class OrderItem {
        private Integer dishId;
        private Integer quantity;
        private String notes;
        private Double unitPrice;
    }
}