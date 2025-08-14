package com.system.restaurant.management.repository;

import com.system.restaurant.management.entity.OrderDetail;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderDetailRepository extends JpaRepository<OrderDetail, Integer> {
    @Query("SELECT od FROM OrderDetail od LEFT JOIN FETCH od.dish WHERE od.statusId = :statusId")
    List<OrderDetail> findByStatusId(Integer statusId);

    @Query("SELECT DISTINCT od FROM OrderDetail od " +
           "LEFT JOIN FETCH od.order o " +
           "LEFT JOIN FETCH o.table t " +
           "LEFT JOIN FETCH od.dish d " +
           "WHERE od.statusId = :statusId")
    List<OrderDetail> findByStatusIdWithDetails(Integer statusId);

    @Query("SELECT DISTINCT od FROM OrderDetail od " +
           "LEFT JOIN FETCH od.order o " +
           "LEFT JOIN FETCH o.table t " +
           "LEFT JOIN FETCH od.dish d " +
           "WHERE od.orderDetailId = :id")
    Optional<OrderDetail> findByIdWithDetails(Integer id);

    @EntityGraph(attributePaths = {"dish", "combo"})
    List<OrderDetail> findByOrderId(Integer orderId);
    Optional<OrderDetail> findByOrderIdAndDishId(Integer orderId, Integer dishId);
    
    @Query("SELECT od FROM OrderDetail od LEFT JOIN FETCH od.dish WHERE od.orderId = :orderId AND od.statusId = :statusId")
    List<OrderDetail> findByOrderIdAndStatusId(Integer orderId, Integer statusId);
}