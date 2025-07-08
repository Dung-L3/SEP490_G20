package com.system.restaurant.management.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "Orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "OrderID")
    private Integer orderId;

    @Column(name = "OrderType", length = 20, nullable = false)
    private String orderType;

    @Column(name = "CustomerName", length = 200, nullable = false)
    private String customerName;

    @Column(name = "Phone", length = 20, nullable = false)
    private String phone;

    @Column(name = "SubTotal", precision = 10, scale = 2)
    private BigDecimal subTotal;

    @Column(name = "DiscountAmount", precision = 10, scale = 2)
    private BigDecimal discountAmount;

    @Column(name = "FinalTotal", precision = 10, scale = 2)
    private BigDecimal finalTotal;

    @Column(name = "StatusID", nullable = false)
    private Integer statusId;

    @Column(name = "IsRefunded", nullable = false)
    private Boolean isRefunded;

    @Column(name = "Notes", length = 500)
    private String notes;

    @Column(name = "CreatedAt", nullable = false)
    private LocalDateTime createdAt;

    // Relationship with RestaurantTable
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "TableID")
    private RestaurantTable table;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (isRefunded == null) {
            isRefunded = false;
        }
    }
}