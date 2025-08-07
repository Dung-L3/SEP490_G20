package com.system.restaurant.management.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TableOrderResponse {
    private Integer orderId;
    private Integer orderDetailId;
    private String message;
    
    // Additional fields for complex responses
    private Integer tableId;
    private String status;
    private List<OrderItemRequest> items;
    private BigDecimal subTotal;
    private BigDecimal discountAmount;
    private BigDecimal finalTotal;
    
    // Constructor for simple responses
    public TableOrderResponse(Integer orderId, Integer orderDetailId, String message) {
        this.orderId = orderId;
        this.orderDetailId = orderDetailId;
        this.message = message;
    }
}