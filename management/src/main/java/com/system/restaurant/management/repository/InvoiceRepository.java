package com.system.restaurant.management.repository;

import com.system.restaurant.management.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Integer> {

    @Query("SELECT i FROM Invoice i WHERE i.order.orderId = :orderId")
    Optional<Invoice> findByOrderId(@Param("orderId") Integer orderId);

    @Query("SELECT i FROM Invoice i WHERE i.order.orderId IN :orderIds")
    List<Invoice> findByOrder_OrderId(@Param("orderIds") List<Integer> orderIds);
}