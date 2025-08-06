package com.system.restaurant.management.service;

import com.system.restaurant.management.dto.PasswordResetDto;
import com.system.restaurant.management.dto.PasswordResetRequest;

public interface PasswordResetService {
    void sendResetOtp(PasswordResetRequest req);
    void resetPassword(PasswordResetDto dto);
}
