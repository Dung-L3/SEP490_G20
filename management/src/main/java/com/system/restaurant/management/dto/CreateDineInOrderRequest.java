package com.system.restaurant.management.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateDineInOrderRequest {
    private Integer tableId;
    private Integer reservationId;
    private String customerName;
    private String customerPhone;
    private String notes;
    private List<OrderItemRequest> orderItems;
}