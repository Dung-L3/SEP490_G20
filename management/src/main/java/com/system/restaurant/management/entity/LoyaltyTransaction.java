package com.system.restaurant.management.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "LoyaltyTransactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoyaltyTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "TransactionID")
    private Integer transactionId;

    @Column(name = "CustomerID", nullable = false)
    private Integer customerId;

    @Column(name = "OrderID")
    private Integer orderId;

    @Column(name = "PointsChange", nullable = false)
    private Integer pointsChange;

    @Column(name = "TransactionAt", nullable = false)
    private LocalDateTime transactionAt;

    @Column(name = "Reason", length = 255)
    private String reason;
}
