package com.system.restaurant.management.dto;

import lombok.Data;
import java.util.List;

@Data
public class CreateOrderRequest {
    private String orderType;
    private String customerName;
    private String customerPhone; // Thêm field này
    private Integer tableId;
    private Integer reservationId; // Thêm field này
    private String notes;
    private List<OrderItemRequest> items; // Thêm field này
}