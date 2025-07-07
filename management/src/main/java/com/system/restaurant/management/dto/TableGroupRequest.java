package com.system.restaurant.management.dto;

import lombok.Data;

import java.util.List;

@Data
public class TableGroupRequest {
    private List<Integer> tableIds;
    private Integer createdBy;
    private String notes;
}