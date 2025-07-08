package com.system.restaurant.management.repository;

import com.system.restaurant.management.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {

    List<Order> findByTableId(Integer tableId);
    List<Order> findByOrderType(String orderType);
    List<Order> findByStatusId(Integer statusId);

    // WaiterService
    List<Order> findByPhone(String phone);
    List<Order> findByStatusIdIn(List<Integer> statusIds);

    // finding orders by table through relationship
    @Query("SELECT o FROM Order o WHERE o.table.tableId = :tableId")
    List<Order> findByTable_TableId(@Param("tableId") Integer tableId);

}