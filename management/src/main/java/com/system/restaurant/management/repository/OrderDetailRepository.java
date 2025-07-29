package com.system.restaurant.management.repository;

import com.system.restaurant.management.entity.OrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderDetailRepository extends JpaRepository<OrderDetail, Integer> {
    List<OrderDetail> findByStatusId(Integer statusId);
    List<OrderDetail> findByOrderId(Integer orderId);
    Optional<OrderDetail> findByOrderIdAndDishId(Integer orderId, Integer dishId);
}