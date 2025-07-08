package com.system.restaurant.management.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateTakeawayOrderRequest {
    private String customerName;
    private String customerPhone;
    private String notes;
    private List<OrderItemRequest> orderItems;
}