package com.system.restaurant.management.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CreateDineInOrderRequest {
    private Integer tableId;
    private Integer reservationId;
    private String customerName;
    private String customerPhone;
    private String notes;
}