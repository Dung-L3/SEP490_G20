package com.system.restaurant.management.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "KitchenTickets")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class KitchenTicket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "TicketID")
    private Integer ticketId;

    @Column(name = "OrderID", nullable = false)
    private Integer orderId;

    @Column(name = "PrintedAt", nullable = false)
    private LocalDateTime printedAt = LocalDateTime.now();

    @Column(name = "PrintedBy")
    private Integer printedBy;

}