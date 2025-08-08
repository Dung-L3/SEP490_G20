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
    public static class Status {
        public static final String AVAILABLE = "Available";
        public static final String RESERVED = "Reserved";
        public static final String OCCUPIED = "Occupied";
    }
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "TableID")
    private Integer tableId;

    @Column(name = "TableName", length = 50, nullable = false)
    private String tableName;

    @Column(name = "AreaID", nullable = false)
    private Integer areaId;

    @Column(name = "Status", length = 20, nullable = false)
    private String status;

    @Column(name = "IsWindow", nullable = false)
    private Boolean isWindow;

    @Column(name = "Notes", length = 255)
    private String notes;

    @Column(name = "CreatedAt", nullable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "table", fetch = FetchType.LAZY)
    @JsonIgnoreProperties("table")  // Thay đổi này thay thế @JsonManagedReference
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