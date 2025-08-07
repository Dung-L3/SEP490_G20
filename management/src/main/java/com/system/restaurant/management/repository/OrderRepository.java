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

    // Methods for table group orders
    @Query("SELECT o FROM Order o WHERE o.tableGroupId = :tableGroupId AND o.statusId IN :statusIds")
    List<Order> findByTableGroupIdAndStatusIdIn(@Param("tableGroupId") Integer tableGroupId, @Param("statusIds") List<Integer> statusIds);

    @Query("SELECT o FROM Order o WHERE o.tableGroupId = :tableGroupId")
    List<Order> findByTableGroupId(@Param("tableGroupId") Integer tableGroupId);

    @Query("SELECT o FROM Order o WHERE o.tableGroupId = :tableGroupId AND o.statusId IN (1, 2)")
    Optional<Order> findActiveOrderByTableGroupId(@Param("tableGroupId") Integer tableGroupId);

    // Update orders to set tableGroupId when merging tables
    @Modifying
    @Query("UPDATE Order o SET o.tableGroupId = :tableGroupId WHERE o.tableId IN :tableIds AND o.statusId IN (1, 2)")
    void updateOrdersWithTableGroupId(@Param("tableGroupId") Integer tableGroupId, @Param("tableIds") List<Integer> tableIds);

    // Transfer orders from group back to primary table when splitting
    @Modifying
    @Query("UPDATE Order o SET o.tableGroupId = null, o.tableId = :primaryTableId WHERE o.tableGroupId = :groupId")
    void updateOrdersFromGroupToTable(@Param("groupId") Integer groupId, @Param("primaryTableId") Integer primaryTableId);
}