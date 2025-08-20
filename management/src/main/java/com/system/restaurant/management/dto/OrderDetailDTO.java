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
        String name = null;
        if (detail.getDish() != null && detail.getDish().getDishName() != null) {
            name = detail.getDish().getDishName();
        } else if (detail.getCombo() != null && detail.getCombo().getComboName() != null) {
            name = detail.getCombo().getComboName();
        } else {
            name = "Món không xác định";
        }

        return new OrderDetailDTO(
                detail.getOrderDetailId(),
                name,
                detail.getQuantity(),
                detail.getUnitPrice() != null ? detail.getUnitPrice() : BigDecimal.ZERO,
                detail.getNotes()
        );
    }
}