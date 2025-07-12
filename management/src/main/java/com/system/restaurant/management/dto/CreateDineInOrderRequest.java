package com.system.restaurant.management.dto;

import lombok.Data;
import java.util.List;

@Data
public class CreateDineInOrderRequest {
    private String customerName;
    private String customerPhone;
    private Integer tableId;
    private Integer reservationId;
    private String notes;
    private List<OrderItemRequest> orderItems;
}