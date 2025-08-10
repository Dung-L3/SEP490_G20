package com.system.restaurant.management.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class KitchenOrderDTO {
    private Integer orderDetailId;
    private Integer orderId;
    private String dishName;
    private Integer quantity;
    private String status;
    private String tableNumber;
    private LocalDateTime orderTime;
    private String notes;
    private String orderType;
}
