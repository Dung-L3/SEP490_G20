package com.system.restaurant.management.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class KitchenOrderDTO {
    private Integer orderDetailId;
    private Integer orderId;
    private String dishName;
    private Integer quantity;
    private String status;
    private String notes;
    private String tableNumber;
    private LocalDateTime orderTime;
}
