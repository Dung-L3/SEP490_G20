package com.system.restaurant.management.service;

import com.system.restaurant.management.entity.PaymentMethod;

import java.util.List;

public interface PaymentService {
    List<PaymentMethod> getAllMethodNames();
}