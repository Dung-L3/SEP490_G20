//package com.system.restaurant.management.repository;
//
//import com.system.restaurant.management.entity.Order;
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.stereotype.Repository;
//
//import java.util.List;
//
//@Repository
//public interface OrderRepository extends JpaRepository<Order, Integer> {
//    List<Order> findByTable_TableId(Integer tableId);
//    List<Order> findByOrderType(String orderType);
//    List<Order> findByStatusId(Integer statusId);
//}