package com.system.restaurant.management.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "ReservationNotifications")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ReservationNotification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "NotificationID")
    private Integer notificationId;

    @Column(name = "ReservationID", nullable = false)
    private Integer reservationId;     // FK → Reservations

    @Column(name = "SentAt", nullable = false)
    private LocalDateTime sentAt;

    @Column(name = "Channel", nullable = false, length = 20)
    private String channel;

    @Column(name = "Status", length = 20)
    private String status;

    @Column(name = "Notes", length = 255)
    private String notes;
}