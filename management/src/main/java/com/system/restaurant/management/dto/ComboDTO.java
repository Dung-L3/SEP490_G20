package com.system.restaurant.management.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class ComboDTO {
    private Integer comboId;
    private String comboName;
    private BigDecimal price;
    private String description;
    private List<ComboItemDTO> comboItems;
}