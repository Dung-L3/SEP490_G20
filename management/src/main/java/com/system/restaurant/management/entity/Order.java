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

    @Column(name = "OrderType", nullable = false, length = 20)
    private String orderType;

    @Column(name = "CustomerName", length = 200)
    private String customerName;

    @Column(name = "Phone", length = 20)
    private String phone;

    @Column(name = "SubTotal", nullable = false)
    private BigDecimal subTotal;

    @Column(name = "DiscountAmount", nullable = false)
    private BigDecimal discountAmount;

    @Column(name = "FinalTotal", nullable = false)
    private BigDecimal finalTotal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "TableID")
    private RestaurantTable table;

    @Column(name = "CreatedAt", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "StatusID", nullable = false)
    private Integer statusId;

    @Column(name = "IsRefunded", nullable = false)
    private Boolean isRefunded;

    @Column(name = "Notes", length = 255)
    private String notes;

    @Column(name = "IsLocked")
    private Boolean isLocked = false;
}
