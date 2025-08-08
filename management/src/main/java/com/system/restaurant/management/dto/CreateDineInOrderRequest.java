package com.system.restaurant.management.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class CreateDineInOrderRequest {
    @NotNull(message = "Table ID is required")
    private Integer tableId;
    private List<OrderItemRequest> items;
    private String notes;

    public CreateDineInOrderRequest() {}

    public CreateDineInOrderRequest(TableOrderRequest request) {
        this.tableId = request.getTableId();
        this.items = request.getItems().stream()
            .map(item -> {
                OrderItemRequest orderItem = new OrderItemRequest();
                orderItem.setDishId(item.getDishId());
                orderItem.setQuantity(item.getQuantity());
                orderItem.setNotes(item.getNotes());
                return orderItem;
            })
            .collect(java.util.stream.Collectors.toList());
    }
}