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
@Table(name = "Invoices")
public class Invoice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "InvoiceID")
    private Integer invoiceId;

    @Column(name = "OrderID", nullable = false)
    private Integer orderId;

    @Column(name = "InvoiceNumber", length = 50, nullable = false)
    private String invoiceNumber;

    @Column(name = "TotalAmount", precision = 10, scale = 2, nullable = false)
    private BigDecimal totalAmount;

    @Column(name = "DiscountAmount", precision = 10, scale = 2)
    private BigDecimal discountAmount;

    @Column(name = "FinalAmount", precision = 10, scale = 2, nullable = false)
    private BigDecimal finalAmount;

    @Column(name = "CreatedAt", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "CustomerPhone", length = 20)
    private String customerPhone;

    @Column(name = "CustomerName", length = 200)
    private String customerName;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}