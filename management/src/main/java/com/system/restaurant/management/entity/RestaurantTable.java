package com.system.restaurant.management.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "RestaurantTables")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class RestaurantTable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "TableID")
    private Integer tableId;

    @Column(name = "TableName", length = 50, nullable = false)
    private String tableName;

    @Column(name = "AreaID", nullable = false)
    private Integer areaId;

    @Column(name = "TableType", length = 50)
    private String tableType;

    @Column(name = "Status", length = 20, nullable = false)
    private String status;

    @Column(name = "IsWindow", nullable = false)
    private Boolean isWindow;

    @Column(name = "Notes", length = 255)
    private String notes;

    @Column(name = "CreatedAt", nullable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "tableId", fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private List<Order> orders;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (isWindow == null) {
            isWindow = false;
        }
    }
    public RestaurantTable(Integer tableId) {
        this.tableId = tableId;
    }
}