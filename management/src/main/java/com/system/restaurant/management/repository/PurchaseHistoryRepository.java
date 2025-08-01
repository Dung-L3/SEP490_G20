package com.system.restaurant.management.repository;

import com.system.restaurant.management.entity.Order;
import com.system.restaurant.management.dto.PurchaseHistoryDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseHistoryRepository
        extends JpaRepository<Order, Integer> {

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
        pm.methodName,
        o.isRefunded
      )
      FROM Order o
      JOIN Invoice i ON i.order.orderId = o.orderId
      JOIN PaymentRecord pr ON pr.invoice.invoiceId = i.invoiceId
      JOIN PaymentMethod pm ON pm.methodId = pr.methodId
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
        pm.methodName,
        o.isRefunded
      )
      FROM Order o
      JOIN Invoice i ON i.order.orderId = o.orderId
      JOIN PaymentRecord pr ON pr.invoice.invoiceId = i.invoiceId
      JOIN PaymentMethod pm ON pm.methodId = pr.methodId
      WHERE o.phone = :phone
      """)
    List<PurchaseHistoryDto> findHistoryByPhone(@Param("phone") String phone);
}