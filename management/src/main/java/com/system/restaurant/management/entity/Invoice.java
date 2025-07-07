package com.system.restaurant.management.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "Invoices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "InvoiceID")
    private Integer invoiceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "OrderID", nullable = false)
    private Order order;

    @Column(name = "SubTotal", nullable = false)
    private BigDecimal subTotal;

    @Column(name = "DiscountAmount", nullable = false)
    private BigDecimal discountAmount;

    @Column(name = "FinalTotal", nullable = false)
    private BigDecimal finalTotal;

    @Column(name = "IssuedBy", nullable = false)
    private Integer issuedBy;

    @Column(name = "IssuedAt", nullable = false)
    private LocalDateTime issuedAt;
}
