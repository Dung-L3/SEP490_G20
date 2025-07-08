package com.system.restaurant.management.dto;

import lombok.Data;
import com.system.restaurant.management.entity.*;

@Data
public class CheckInResponse {
    private Reservation reservation;
    private RestaurantTable table;
    private Order createdOrder;
    private String message;
}