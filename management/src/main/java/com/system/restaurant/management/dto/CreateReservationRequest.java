package com.system.restaurant.management.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CreateReservationRequest {
    private String customerName;
    private String phone;
    private Integer tableId;
    private LocalDateTime reservationDate;
    private Integer partySize;
    private String notes;
}