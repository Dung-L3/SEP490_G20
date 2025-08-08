package com.system.restaurant.management.service;

import com.system.restaurant.management.dto.OrderDto;
import com.system.restaurant.management.dto.OrderRequestDto;
import com.system.restaurant.management.entity.Order;
import com.system.restaurant.management.entity.OrderDetail;

import java.util.List;

public interface OrderService {
    OrderDto findById(Integer id);
    
    List<OrderDto> getUnpaidOrders();
    
    // Methods for QR Menu
    List<OrderDto> findAll();
    OrderRequestDto createOrder(OrderRequestDto orderDto);
    List<Object> getActiveOrderItemsByTable(Integer tableId);

    void cancelOrderDetail(Integer orderDetailId);
    OrderDetail replaceOrderDetail(Integer orderDetailId, OrderDetail newOrderDetail);
    List<Order> getOrdersByTable(Integer tableId);
    Order getOrderById(Integer orderId);
    List<OrderDetail> getOrderDetails(Integer orderId);

    Order createOrder(Order order);
    Order updateOrder(Order order);
    OrderDetail addOrderDetail(OrderDetail orderDetail);
    OrderDetail updateOrderDetail(OrderDetail orderDetail);
}
