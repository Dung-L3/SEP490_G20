// src/main/java/com/system/restaurant/management/dto/OrderDetailDTO.java
package com.system.restaurant.management.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderDetailDTO {
    private Integer orderDetailId;
    private String dishName;
    private Integer quantity;
    private BigDecimal unitPrice;

    public static OrderDetailDTO fromEntity(com.system.restaurant.management.entity.OrderDetail detail) {
        return new OrderDetailDTO(
                detail.getOrderDetailId(),
                detail.getDish().getDishName(),
                detail.getQuantity(),
                detail.getUnitPrice()
        );
    }
}
