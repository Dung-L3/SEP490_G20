package com.system.restaurant.management.service;

import com.system.restaurant.management.dto.TableOrderRequest;
import com.system.restaurant.management.dto.TableOrderResponse;
import com.system.restaurant.management.entity.Order;
import com.system.restaurant.management.entity.OrderDetail;

import java.util.List;

public interface OrderService {
    Order createOrder(Order order);
    Order updateOrder(Order order);
    OrderDetail addOrderDetail(OrderDetail orderDetail);
    OrderDetail updateOrderDetail(OrderDetail orderDetail);
    void cancelOrderDetail(Integer orderDetailId);
    OrderDetail replaceOrderDetail(Integer orderDetailId, OrderDetail newOrderDetail);
    List<Order> getOrdersByTable(Integer tableId);
    Order getOrderById(Integer orderId);
    List<OrderDetail> getOrderDetails(Integer orderId);

    TableOrderResponse addTableOrderItem(TableOrderRequest request);
    TableOrderResponse updateTableOrderItem(Integer tableId, Integer dishId, Integer quantity);
    TableOrderResponse removeTableOrderItem(Integer tableId, Integer dishId);
    void cancelTableOrder(Integer tableId);
    List<Order> getOrdersByTableAndStatuses(Integer tableId, List<Integer> statusIds);
}