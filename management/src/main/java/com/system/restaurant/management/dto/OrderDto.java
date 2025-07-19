package com.system.restaurant.management.dto;


import com.system.restaurant.management.entity.Order;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderDto {
    private Integer orderId;
    private String orderType;
    private String customerName;
    private String tableName;
    private BigDecimal subTotal;
    private BigDecimal discountAmount;
    private BigDecimal finalTotal;
    private LocalDateTime createdAt;
}

