package com.system.restaurant.management.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TableStatusRequest {
    @NotBlank
    private String status;
}