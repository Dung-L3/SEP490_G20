package com.system.restaurant.management.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "PaymentRecords")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PaymentRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PaymentID")
    private Integer paymentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "InvoiceID", nullable = false)
    private Invoice invoice;

    @Column(name = "MethodID", nullable = false)
    private Integer methodId;

    @Column(name = "Amount", nullable = false)
    private BigDecimal amount;

    @Column(name = "PaidAt", nullable = false)
    private LocalDateTime paidAt;

    @Column(name = "Notes", length = 255)
    private String notes;
}
