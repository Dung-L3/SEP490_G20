package com.system.restaurant.management.service;

import com.system.restaurant.management.dto.LoginRequest;
import com.system.restaurant.management.dto.LoginResponse;
import com.system.restaurant.management.dto.RegisterRequest;
import com.system.restaurant.management.entity.User;

public interface AuthService {
    void registerEmployee(RegisterRequest req);
    void registerCustomer(RegisterRequest req);
    User validateLogin(LoginRequest req);
}