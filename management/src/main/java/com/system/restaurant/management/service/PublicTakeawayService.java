package com.system.restaurant.management.service;

import com.system.restaurant.management.dto.CreateTakeawayOrderRequest;

public interface PublicTakeawayService {
    Integer createTakeawayOrder(CreateTakeawayOrderRequest req);
}
