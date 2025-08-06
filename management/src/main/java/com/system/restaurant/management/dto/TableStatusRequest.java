package com.system.restaurant.management.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TableStatusRequest {
    @NotBlank
    private String status;
    private Integer tableId;
    private LocalDateTime updatedAt;
}