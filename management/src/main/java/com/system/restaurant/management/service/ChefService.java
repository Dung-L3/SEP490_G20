package com.system.restaurant.management.service;

import com.system.restaurant.management.dto.KitchenOrderDTO;
import java.util.List;

public interface ChefService {
    List<KitchenOrderDTO> getPendingOrders();
}
