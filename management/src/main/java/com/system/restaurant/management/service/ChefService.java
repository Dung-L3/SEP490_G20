package com.system.restaurant.management.service;

import java.util.List;
import java.util.Map;

public interface ChefService {
    List<Map<String, Object>> getPendingKitchenOrders();
    void updateOrderDetailStatus(Integer orderDetailId, String status);
}
