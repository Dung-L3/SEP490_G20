package com.system.restaurant.management.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "PaymentMethods")
public class PaymentMethod {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MethodID")
    private Integer methodId;

    @Column(name = "MethodName", length = 50, nullable = false)
    private String methodName;

    @Column(name = "IsActive", nullable = false)
    private Boolean isActive = true;
}