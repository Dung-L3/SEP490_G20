package com.system.restaurant.management.repository;

import com.system.restaurant.management.entity.OrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderDetailRepository extends JpaRepository<OrderDetail, Integer> {
    List<OrderDetail> findByOrderId(Integer orderId);
    List<OrderDetail> findByOrderIdAndIsRefunded(Integer orderId, Integer isRefunded);

    //table ordering
    Optional<OrderDetail> findByOrderIdAndDishId(Integer orderId, Integer dishId);

    @Query("SELECT od FROM OrderDetail od WHERE od.orderId = :orderId AND od.dishId = :dishId AND od.statusId IN (1, 2)")
    Optional<OrderDetail> findActiveDetailByOrderIdAndDishId(
            @Param("orderId") Integer orderId,
            @Param("dishId") Integer dishId
    );

    List<OrderDetail> findByOrderIdAndStatusId(Integer orderId, Integer statusId);

    @Query("DELETE FROM OrderDetail od WHERE od.orderId = :orderId AND od.statusId = 1")
    @Modifying
    void deletePendingDetailsByOrderId(@Param("orderId") Integer orderId);
}