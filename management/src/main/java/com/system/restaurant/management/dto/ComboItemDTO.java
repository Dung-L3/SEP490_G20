package com.system.restaurant.management.dto;

import lombok.Data;

@Data
public class ComboItemDTO {
    private Integer dishId;
    private String dishName;
    private Integer quantity;
    private String unit;
}