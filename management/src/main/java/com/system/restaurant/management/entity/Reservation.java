package com.system.restaurant.management.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "Reservations")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Reservation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ReservationID")
    private Integer reservationId;

    @Column(name = "CustomerID")
    private Integer customerId;

    @Column(name = "CustomerName", length = 255)
    private String customerName;

    @Column(name = "Phone", length = 20, nullable = false)
    private String phone;

    @Column(name = "Email", length = 100)
    private String email;

    @Column(name = "TableID", nullable = false)
    private Integer tableId;

    @Column(name = "ReservationAt", nullable = false)
    private LocalDateTime reservationAt;

    @Column(name = "StatusID", nullable = false)
    private Integer statusId; // Thêm field này

    @Column(name = "CreatedAt", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "Notes", length = 255)
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "TableID", insertable = false, updatable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private RestaurantTable table;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (statusId == null) {
            statusId = 1; // Pending
        }
    }
}