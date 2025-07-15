package com.system.restaurant.management.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Future;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CreateReservationRequest {
    private Integer customerId;

    @NotBlank(message = "Customer name is required")
    private String customerName;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^\\d{10}$", message = "Phone number must be 10 digits")
    private String phone;

    private String email;

    @NotNull(message = "Table ID is required")
    private Integer tableId;

    @NotNull(message = "Reservation date/time is required")
    @Future(message = "Reservation must be in the future")
    private LocalDateTime reservationAt;

    private String notes;
}