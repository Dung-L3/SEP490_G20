package com.system.restaurant.management.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "Customers")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CustomerID")
    private Integer customerId;

    @Column(name = "FullName", length = 100)
    private String fullName;

    @Column(name = "Phone", length = 20)
    private String phone;

    @Column(name = "Email", length = 100)
    private String email;

    @Column(name = "LoyaltyPoints", nullable = false)
    private Integer loyaltyPoints = 0;

    @Column(name = "MemberSince", nullable = false)
    private LocalDate memberSince;

    @PrePersist
    protected void onCreate() {
        if (memberSince == null) {
            memberSince = LocalDate.now();
        }
        if (loyaltyPoints == null) {
            loyaltyPoints = 0;
        }
    }
}