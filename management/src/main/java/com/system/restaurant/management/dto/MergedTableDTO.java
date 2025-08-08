package com.system.restaurant.management.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MergedTableDTO {
    private Integer groupId;
    private String mergedTableName; // "Bàn 1 + Bàn 2 + Bàn 3"
    private List<String> individualTableNames;
    private List<Integer> tableIds;
    private String status;
    private Integer createdBy;
    private LocalDateTime createdAt;
    private String notes;
}