package com.system.restaurant.management.repository;

import com.system.restaurant.management.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {

    @Query("SELECT o FROM Order o WHERE o.statusId IN :statusIds ORDER BY o.createdAt DESC")
    List<Order> findByStatusIdIn(@Param("statusIds") List<Integer> statusIds);

    @Query("SELECT o FROM Order o WHERE o.tableId = :tableId ORDER BY o.createdAt DESC")
    List<Order> findByTableIdOrderByCreatedAtDesc(@Param("tableId") Integer tableId);

    @Query("SELECT o FROM Order o WHERE o.phone = :phone ORDER BY o.createdAt DESC")
    List<Order> findByPhoneOrderByCreatedAtDesc(@Param("phone") String phone);

    @Query("SELECT o FROM Order o WHERE o.orderType = :orderType ORDER BY o.createdAt DESC")
    List<Order> findByOrderTypeOrderByCreatedAtDesc(@Param("orderType") String orderType);

    @Query("SELECT o FROM Order o WHERE o.statusId = :statusId ORDER BY o.createdAt DESC")
    List<Order> findByStatusIdOrderByCreatedAtDesc(@Param("statusId") Integer statusId);
}