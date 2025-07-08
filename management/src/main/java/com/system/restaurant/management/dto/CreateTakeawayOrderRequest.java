package com.system.restaurant.management.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CreateTakeawayOrderRequest {
    private String customerName;
    private String customerPhone;
    private String notes;
    private String pickupTime;
}