package com.system.restaurant.management.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "OrderDetails")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class OrderDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "OrderDetailID")
    private Integer orderDetailId;

    @Column(name = "OrderID", nullable = false)
    private Integer orderId;

    @Column(name = "DishID", nullable = false)
    private Integer dishId;

    @Column(name = "ComboID")
    private Integer comboId;

    @Column(name = "Quantity", nullable = false)
    private Integer quantity;

    @Column(name = "UnitPrice", precision = 10, scale = 2, nullable = false)
    private BigDecimal unitPrice;

    @Column(name = "StatusID", nullable = false)
    private Integer statusId;

    @Column(name = "IsRefunded", nullable = false)
    private Integer isRefunded;

    @Column(name = "Notes", length = 255)
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "OrderID", insertable = false, updatable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Order order;

    @PrePersist
    protected void onCreate() {
        if (statusId == null) {
            statusId = 1; // Pending
        }
        if (isRefunded == null) {
            isRefunded = 0;
        }
    }
}