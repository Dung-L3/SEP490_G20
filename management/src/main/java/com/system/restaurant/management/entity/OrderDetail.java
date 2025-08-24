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

    @Column(name = "DishID")
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "DishID", insertable = false, updatable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Dish dish;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ComboID", insertable = false, updatable = false)
    private Combo combo;

    @PrePersist
    protected void onCreate() {
        if (statusId == null) {
            statusId = 1;
        }
        if (isRefunded == null) {
            isRefunded = 0;
        }
        // Validate dishId hoặc comboId phải có giá trị
        if (dishId == null && comboId == null) {
            throw new IllegalStateException("Either DishID or ComboID must be provided");
        }
    }

    // Method to get dish name
    @Transient
    public String getDishName() {
        return dish != null ? dish.getDishName() : null;
    }
}