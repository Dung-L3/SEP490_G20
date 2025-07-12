package com.system.restaurant.management.dto;

import lombok.Data;
import java.util.List;

@Data
public class CreateTakeawayOrderRequest {
    private String customerName;
    private String customerPhone;
    private String notes;
    private List<OrderItemRequest> orderItems;
}