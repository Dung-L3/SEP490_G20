package com.system.restaurant.management.entity;

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
public class Reservation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ReservationID")
    private Integer reservationId;

    @Column(name = "CustomerName", length = 200, nullable = false)
    private String customerName;

    @Column(name = "Phone", length = 20, nullable = false)
    private String phone;

    @Column(name = "TableID")
    private Integer tableId;

    @Column(name = "ReservationDate", nullable = false)
    private LocalDateTime reservationDate;

    @Column(name = "PartySize", nullable = false)
    private Integer partySize;

    @Column(name = "Status", length = 20, nullable = false)
    private String status;

    @Column(name = "Notes", length = 255)
    private String notes;

    @Column(name = "CreatedAt", nullable = false)
    private LocalDateTime createdAt;
}