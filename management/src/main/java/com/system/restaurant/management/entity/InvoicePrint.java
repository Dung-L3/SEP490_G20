package com.system.restaurant.management.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "InvoicePrints")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoicePrint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PrintID")
    private Integer printId;

    @Column(name = "InvoiceID", nullable = false)
    private Integer invoiceId;

    @Column(name = "PrintedAt", nullable = false)
    private LocalDateTime printedAt;

    @Column(name = "PrintedBy")
    private Integer printedBy;
}
