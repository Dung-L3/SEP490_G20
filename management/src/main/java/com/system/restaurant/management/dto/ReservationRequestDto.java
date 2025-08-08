package com.system.restaurant.management.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ReservationRequestDto {
    private Integer customerId;
    private String customerName;
    private String phone;
    private String email;
    private Integer tableId;
    private LocalDateTime reservationAt;
    private String notes;
}
