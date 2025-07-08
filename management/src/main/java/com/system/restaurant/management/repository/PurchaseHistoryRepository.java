package com.system.restaurant.management.repository;

import com.system.restaurant.management.entity.Order;
import com.system.restaurant.management.dto.PurchaseHistoryDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PurchaseHistoryRepository extends JpaRepository<Order, Integer> {

    @Query("""
        SELECT new com.system.restaurant.management.dto.PurchaseHistoryDto(
            o.orderId,
            o.createdAt,
            o.customerName,
            o.phone,
            o.orderType,
            o.subTotal,
            o.discountAmount,
            o.finalTotal,
            COALESCE(pm.methodName, 'Cash'),
            COALESCE(o.isRefunded, false)
        )
        FROM Order o
        LEFT JOIN Invoice i ON i.order.orderId = o.orderId
        LEFT JOIN PaymentRecord pr ON pr.invoice.invoiceId = i.invoiceId
        LEFT JOIN PaymentMethod pm ON pm.methodId = pr.paymentMethod.methodId
        WHERE o.statusId = 4
        ORDER BY o.createdAt DESC
        """)
    List<PurchaseHistoryDto> findAllHistory();

    @Query("""
        SELECT new com.system.restaurant.management.dto.PurchaseHistoryDto(
            o.orderId,
            o.createdAt,
            o.customerName,
            o.phone,
            o.orderType,
            o.subTotal,
            o.discountAmount,
            o.finalTotal,
            COALESCE(pm.methodName, 'Cash'),
            COALESCE(o.isRefunded, false)
        )
        FROM Order o
        LEFT JOIN Invoice i ON i.order.orderId = o.orderId
        LEFT JOIN PaymentRecord pr ON pr.invoice.invoiceId = i.invoiceId
        LEFT JOIN PaymentMethod pm ON pm.methodId = pr.paymentMethod.methodId
        WHERE o.phone = :phone AND o.statusId = 4
        ORDER BY o.createdAt DESC
        """)
    List<PurchaseHistoryDto> findHistoryByPhone(@Param("phone") String phone);

    @Query("""
        SELECT new com.system.restaurant.management.dto.PurchaseHistoryDto(
            o.orderId,
            o.createdAt,
            o.customerName,
            o.phone,
            o.orderType,
            o.subTotal,
            o.discountAmount,
            o.finalTotal,
            COALESCE(pm.methodName, 'Cash'),
            COALESCE(o.isRefunded, false)
        )
        FROM Order o
        LEFT JOIN Invoice i ON i.order.orderId = o.orderId
        LEFT JOIN PaymentRecord pr ON pr.invoice.invoiceId = i.invoiceId
        LEFT JOIN PaymentMethod pm ON pm.methodId = pr.paymentMethod.methodId
        WHERE LOWER(o.customerName) LIKE LOWER(CONCAT('%', :customerName, '%')) AND o.statusId = 4
        ORDER BY o.createdAt DESC
        """)
    List<PurchaseHistoryDto> findHistoryByCustomerName(@Param("customerName") String customerName);

    @Query("""
        SELECT new com.system.restaurant.management.dto.PurchaseHistoryDto(
            o.orderId,
            o.createdAt,
            o.customerName,
            o.phone,
            o.orderType,
            o.subTotal,
            o.discountAmount,
            o.finalTotal,
            COALESCE(pm.methodName, 'Cash'),
            COALESCE(o.isRefunded, false)
        )
        FROM Order o
        LEFT JOIN Invoice i ON i.order.orderId = o.orderId
        LEFT JOIN PaymentRecord pr ON pr.invoice.invoiceId = i.invoiceId
        LEFT JOIN PaymentMethod pm ON pm.methodId = pr.paymentMethod.methodId
        WHERE o.createdAt BETWEEN :startDate AND :endDate AND o.statusId = 4
        ORDER BY o.createdAt DESC
        """)
    List<PurchaseHistoryDto> findHistoryByDateRange(@Param("startDate") LocalDateTime startDate,
                                                    @Param("endDate") LocalDateTime endDate);

    @Query("""
        SELECT new com.system.restaurant.management.dto.PurchaseHistoryDto(
            o.orderId,
            o.createdAt,
            o.customerName,
            o.phone,
            o.orderType,
            o.subTotal,
            o.discountAmount,
            o.finalTotal,
            COALESCE(pm.methodName, 'Cash'),
            COALESCE(o.isRefunded, false)
        )
        FROM Order o
        LEFT JOIN Invoice i ON i.order.orderId = o.orderId
        LEFT JOIN PaymentRecord pr ON pr.invoice.invoiceId = i.invoiceId
        LEFT JOIN PaymentMethod pm ON pm.methodId = pr.paymentMethod.methodId
        WHERE o.orderType = :orderType AND o.statusId = 4
        ORDER BY o.createdAt DESC
        """)
    List<PurchaseHistoryDto> findHistoryByOrderType(@Param("orderType") String orderType);

    @Query("""
        SELECT o.phone, o.customerName, COUNT(o), SUM(o.finalTotal)
        FROM Order o
        WHERE o.statusId = 4
        GROUP BY o.phone, o.customerName
        ORDER BY SUM(o.finalTotal) DESC
        """)
    List<Object[]> findTopCustomersByTotalSpent();

    @Query("""
        SELECT YEAR(o.createdAt), MONTH(o.createdAt), COUNT(o), SUM(o.finalTotal)
        FROM Order o
        WHERE o.statusId = 4
        GROUP BY YEAR(o.createdAt), MONTH(o.createdAt)
        ORDER BY YEAR(o.createdAt) DESC, MONTH(o.createdAt) DESC
        """)
    List<Object[]> findMonthlyStatistics();
}