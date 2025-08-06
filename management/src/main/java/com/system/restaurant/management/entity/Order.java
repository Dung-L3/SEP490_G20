package com.system.restaurant.management.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "Orders")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "OrderID")
    private Integer orderId;

    @Column(name = "OrderType", length = 20, nullable = false)
    private String orderType;

    @Column(name = "CustomerName", length = 200)
    private String customerName;

    @Column(name = "Phone", length = 20)
    private String phone;

    @Column(name = "SubTotal", precision = 10, scale = 2, nullable = false)
    private BigDecimal subTotal;

    @Column(name = "DiscountAmount", precision = 10, scale = 2)
    private BigDecimal discountAmount;

    @Column(name = "FinalTotal", precision = 10, scale = 2, nullable = false)
    private BigDecimal finalTotal;

    @Column(name = "TableID")
    private Integer tableId;

    @Column(name = "CreatedAt", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "StatusID", nullable = false)
    private Integer statusId;

    @Column(name = "IsRefunded", nullable = false)
    private Integer isRefunded;

    @Column(name = "Notes", length = 255)
    private String notes;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "TableID", insertable = false, updatable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private RestaurantTable table;

    @OneToMany(mappedBy = "orderId", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private List<Invoice> invoices;

    @OneToMany(mappedBy = "orderId", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private List<OrderDetail> orderDetails;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (statusId == null) {
            statusId = 1; // Pending
        }
        if (isRefunded == null) {
            isRefunded = 0; // 0 thay vì false
        }
        if (discountAmount == null) {
            discountAmount = BigDecimal.ZERO;
        }
    }
}