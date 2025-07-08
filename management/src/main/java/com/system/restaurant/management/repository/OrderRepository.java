package com.system.restaurant.management.repository;

import com.system.restaurant.management.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {

    @Query("SELECT o FROM Order o WHERE o.table.tableId = :tableId")
    List<Order> findByTableId(@Param("tableId") Integer tableId);

    @Query("SELECT o FROM Order o WHERE o.table.tableId = :tableId AND o.statusId IN (1, 2, 3)")
    List<Order> findActiveOrdersByTableId(@Param("tableId") Integer tableId);

    List<Order> findByStatusId(Integer statusId);

    List<Order> findByPhone(String phone);

    List<Order> findByOrderType(String orderType);

    List<Order> findByCustomerNameContainingIgnoreCase(String customerName);

    @Query("SELECT o FROM Order o WHERE o.statusId = 4 ORDER BY o.createdAt DESC")
    List<Order> findCompletedOrders();

    @Query("SELECT o FROM Order o WHERE o.createdAt BETWEEN :startDate AND :endDate")
    List<Order> findOrdersByDateRange(@Param("startDate") LocalDateTime startDate,
                                      @Param("endDate") LocalDateTime endDate);

    @Query("SELECT o FROM Order o WHERE o.statusId IN (1, 2, 3) ORDER BY o.createdAt DESC")
    List<Order> findActiveOrders();

    Optional<Order> findByOrderId(Integer orderId);
}