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
    public static class Status {
        public static final int PENDING = 1;
        public static final int CONFIRMED = 2;
        public static final int CANCELLED = 3;

        public static String getName(int statusId) {
            return switch (statusId) {
                case PENDING -> "Pending";
                case CONFIRMED -> "Confirmed";
                case CANCELLED -> "Cancelled";
                default -> throw new IllegalArgumentException("Invalid status ID: " + statusId);
            };
        }

        public static int getIdByName(String statusName) {
            return switch (statusName.toLowerCase()) {
                case "pending" -> PENDING;
                case "confirmed" -> CONFIRMED;
                case "cancelled" -> CANCELLED;
                default -> throw new IllegalArgumentException("Invalid status name: " + statusName);
            };
        }
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ReservationID")
    private Integer reservationId;

    @Column(name = "CustomerID")
    private Integer customerId;

    @Column(name = "CustomerName", length = 255, nullable = false)
    private String customerName;

    @Column(name = "Phone", length = 20, nullable = false)
    private String phone;

    @Column(name = "Email", length = 100, nullable = true)
    private String email;

    @Column(name = "TableID", nullable = true)
    private Integer tableId;

    @Column(name = "ReservationAt", nullable = false)
    private LocalDateTime reservationAt;

    @Column(name = "StatusID", nullable = false)
    private Integer statusId;

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
            statusId = Status.PENDING;
        }
    }

    @Transient
    public String getStatusName() {
        return Status.getName(this.statusId);
    }
}