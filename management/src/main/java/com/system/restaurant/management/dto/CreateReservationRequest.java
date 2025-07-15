package com.system.restaurant.management.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateReservationRequest {
    @NotBlank(message = "Customer name is required")
    private String customerName;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^\\d{10}$", message = "Phone number must be 10 digits")
    private String phone;

    private String email; // Optional

    private Integer tableId; // Optional

    private LocalDateTime reservationAt;

    private String notes;
}