package com.system.restaurant.management.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CreateReservationRequest {
    @NotBlank
    private String customerName;

    @NotBlank
    private String phone;

    private String email;

    @NotNull
    private LocalDateTime reservationAt;

    private Integer tableId;

    private String notes;
}