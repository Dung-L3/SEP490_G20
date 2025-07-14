package com.system.restaurant.management.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Entity
@Table(name = "RestaurantTables")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RestaurantTable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "TableID")
    private Integer tableId;

    @Column(name = "TableName", nullable = false, length = 50)
    private String tableName;

    @Column(name = "AreaID", nullable = false)
    private Integer areaId;

    @Column(name = "TableType", length = 50)
    private String tableType;

    @Column(name = "Status", nullable = false, length = 20)
    private String status;

    @Column(name = "IsWindow", nullable = false)
    private Boolean isWindow = false;

    @Column(name = "Notes", length = 255)
    private String notes;

    @Column(name = "CreatedAt", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public RestaurantTable(Integer tableId) {
        this.tableId = tableId;
    }
}