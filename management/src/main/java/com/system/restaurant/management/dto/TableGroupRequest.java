package com.system.restaurant.management.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class TableGroupRequest {
    private Integer groupId;
    @NotEmpty
    private List<Integer> tableIds;

    @NotNull
    private Integer createdBy;

    private String notes;
    private LocalDateTime createdAt;
}