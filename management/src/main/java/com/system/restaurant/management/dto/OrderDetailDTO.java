// src/main/java/com/system/restaurant/management/dto/OrderDetailDTO.java
package com.system.restaurant.management.dto;

import com.system.restaurant.management.entity.OrderDetail;
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
    private String notes;

    public static OrderDetailDTO fromEntity(OrderDetail detail) {
        return new OrderDetailDTO(
                detail.getOrderDetailId(),
                detail.getDish().getDishName(),   // sẽ không NPE nữa
                detail.getQuantity(),
                detail.getUnitPrice(),
                detail.getNotes()
        );
    }
}
