package com.system.restaurant.management.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "PromoUsage")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PromoUsage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "UsageID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PromoID", nullable = false)
    private Promotion promo;

    @Column(name = "Phone")
    private String phone; // nullable

    @Column(name = "UsedAt", nullable = false)
    private LocalDateTime usedAt;
}
