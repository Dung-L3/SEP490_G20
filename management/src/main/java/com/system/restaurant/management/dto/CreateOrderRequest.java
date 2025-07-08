package com.system.restaurant.management.dto;

import lombok.Data;
import java.util.List;

@Data
public class CreateOrderRequest {
    private Integer tableId;
    private Integer reservationId; // tracking customer phone/name
    private String orderType; // DINEIN or TAKEAWAY
    private String customerPhone;
    private String customerName;
    private List<OrderItemRequest> items;
    private String notes;
}