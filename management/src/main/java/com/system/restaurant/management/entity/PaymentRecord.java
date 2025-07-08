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
@Table(name = "PaymentRecords")
public class PaymentRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PaymentID")
    private Integer paymentId;

    @Column(name = "InvoiceID", nullable = false)
    private Integer invoiceId;

    @Column(name = "MethodID", nullable = false)
    private Integer methodId;

    @Column(name = "Amount", precision = 10, scale = 2, nullable = false)
    private BigDecimal amount;

    @Column(name = "PaymentDate", nullable = false)
    private LocalDateTime paymentDate;

    @Column(name = "Notes", length = 500)
    private String notes;

    @PrePersist
    protected void onCreate() {
        if (paymentDate == null) {
            paymentDate = LocalDateTime.now();
        }
    }
}