package com.system.restaurant.management.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import java.util.List;

@Data
public class CreateOrderRequest {
    private String orderType;
    private String customerName;
    private String customerPhone;
    private Integer tableId;
    private Integer reservationId;
    private String notes;

    @NotEmpty(message = "Order items cannot be empty")
    private List<OrderItemRequest> items;
}