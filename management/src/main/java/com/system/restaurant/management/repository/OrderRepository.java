package com.system.restaurant.management.repository;

import com.system.restaurant.management.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {

    // Find orders by table ID and status IDs
    @Query("SELECT o FROM Order o WHERE o.tableId = :tableId AND o.statusId IN :statusIds")
    List<Order> findByTableIdAndStatusIdIn(@Param("tableId") Integer tableId, @Param("statusIds") List<Integer> statusIds);

    // Find orders by table ID
    @Query("SELECT o FROM Order o WHERE o.table.tableId = :tableId")
    List<Order> findByTable_TableId(@Param("tableId") Integer tableId);

    // Find orders by multiple status IDs
    @Query("SELECT o FROM Order o WHERE o.statusId IN :statusIds")
    List<Order> findByStatusIdIn(@Param("statusIds") List<Integer> statusIds);

    List<Order> findByStatusId(Integer statusId);

    // Find orders by customer phone
    List<Order> findByPhone(String phone);

    // Find orders by order type
    List<Order> findByOrderType(String orderType);

    // table ordering
    @Query("SELECT o FROM Order o WHERE o.tableId = :tableId AND o.statusId = 1")
    Optional<Order> findPendingOrderByTableId(@Param("tableId") Integer tableId);

    @Query("SELECT o FROM Order o WHERE o.tableId = :tableId AND o.statusId IN (1, 2)")
    Optional<Order> findActiveOrderByTableId(@Param("tableId") Integer tableId);


}