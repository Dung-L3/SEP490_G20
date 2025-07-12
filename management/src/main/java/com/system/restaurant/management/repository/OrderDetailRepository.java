package com.system.restaurant.management.repository;

import com.system.restaurant.management.entity.OrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderDetailRepository extends JpaRepository<OrderDetail, Integer> {
    List<OrderDetail> findByOrderId(Integer orderId);
    List<OrderDetail> findByOrderIdAndIsRefunded(Integer orderId, Integer isRefunded);
}