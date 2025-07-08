package com.system.restaurant.management.repository;

import com.system.restaurant.management.entity.OrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderDetailRepository extends JpaRepository<OrderDetail, Integer> {

    @Query("SELECT od FROM OrderDetail od WHERE od.orderId = :orderId")
    List<OrderDetail> findByOrderId(@Param("orderId") Integer orderId);

    @Query("SELECT od FROM OrderDetail od WHERE od.dishId = :dishId")
    List<OrderDetail> findByDishId(@Param("dishId") Integer dishId);

    @Query("SELECT od FROM OrderDetail od WHERE od.comboId = :comboId")
    List<OrderDetail> findByComboId(@Param("comboId") Integer comboId);

    @Query("SELECT od FROM OrderDetail od WHERE od.statusId = :statusId")
    List<OrderDetail> findByStatusId(@Param("statusId") Integer statusId);
}