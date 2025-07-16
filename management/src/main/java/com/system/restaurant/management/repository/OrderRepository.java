package com.system.restaurant.management.repository;

import com.system.restaurant.management.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {

    // Tìm order theo table ID
    @Query("SELECT o FROM Order o WHERE o.table.tableId = :tableId")
    List<Order> findByTable_TableId(@Param("tableId") Integer tableId);

    // Tìm order theo nhiều status
    @Query("SELECT o FROM Order o WHERE o.statusId IN :statusIds")
    List<Order> findByStatusIdIn(@Param("statusIds") List<Integer> statusIds);

    // Tìm order theo status đơn lẻ
    List<Order> findByStatusId(Integer statusId);

    // Tìm order theo số điện thoại khách hàng
    List<Order> findByPhone(String phone);

    // Tìm order theo loại đơn hàng
    List<Order> findByOrderType(String orderType);
}