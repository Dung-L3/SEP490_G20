package com.system.restaurant.management.service;

import com.system.restaurant.management.dto.OrderDetailDTO;

import java.util.List;

public interface OrderDetailService {
    List<OrderDetailDTO> getOrderDetailsByOrderId(Integer orderId);
    List<OrderDetailDTO> getOrderDetailsByOrderIdAndStatus(Integer orderId, Integer statusId);
}
