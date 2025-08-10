package com.system.restaurant.management.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "Promotions", uniqueConstraints = @UniqueConstraint(columnNames = "PromoCode"))
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Promotion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PromoID")
    private Integer promoId;

    @Column(name = "PromoCode", nullable = false, unique = true)
    private String promoCode;

    @Column(name = "PromoName", nullable = false)
    private String promoName;

    @Column(name = "Description")
    private String description;

    @Column(name = "DiscountPercent", precision = 5, scale = 2)
    private BigDecimal discountPercent;

    @Column(name = "DiscountAmount", precision = 18, scale = 2)
    private BigDecimal discountAmount;

    @Column(name = "StartDate", nullable = false)
    private LocalDate startDate;

    @Column(name = "EndDate", nullable = false)
    private LocalDate endDate;

    @Column(name = "UsageLimit")
    private Integer usageLimit;

    @Column(name = "IsActive", nullable = false)
    private Boolean isActive;
}
