package com.system.restaurant.management.service;

import java.math.BigDecimal;

public interface CustomerPointsService {
    void addPoints(Integer orderId, BigDecimal finalTotal);

}