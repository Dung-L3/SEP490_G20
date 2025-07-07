package com.system.restaurant.management.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "PaymentMethods")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentMethod {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MethodID")
    private Integer methodId;

    @Column(name = "MethodName", nullable = false, length = 20, unique = true)
    private String methodName;
}

