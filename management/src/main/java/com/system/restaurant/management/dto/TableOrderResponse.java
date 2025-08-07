package com.system.restaurant.management.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class TableOrderResponse {
    private Integer orderId;
    private Integer tableId;
    private String status;
    private List<OrderItemRequest> items;
    private BigDecimal subTotal;
    private BigDecimal discountAmount;
    private BigDecimal finalTotal;
}