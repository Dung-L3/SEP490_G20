package com.system.restaurant.management.service.serviceImpl;

import com.system.restaurant.management.dto.PasswordResetDto;
import com.system.restaurant.management.dto.PasswordResetRequest;
import com.system.restaurant.management.entity.User;
import com.system.restaurant.management.repository.UserRepository;
import com.system.restaurant.management.service.PasswordResetService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PasswordResetServiceImpl implements PasswordResetService {

    private final UserRepository userRepo;
    private final PasswordEncoder encoder;
    private final OtpService otpService;

    public void sendResetOtp(PasswordResetRequest req) {
        User u = userRepo.findByEmail(req.getEmail())
                .orElseThrow(() -> new EntityNotFoundException("Email không tồn tại"));
        otpService.generateAndSendOtp(u.getEmail());
    }

    public void resetPassword(PasswordResetDto dto) {
        User u = userRepo.findByEmail(dto.getEmail())
                .orElseThrow(() -> new EntityNotFoundException("Email không tồn tại"));

        if (!otpService.validateOtp(dto.getEmail(), dto.getToken())) {
            throw new IllegalArgumentException("OTP không hợp lệ hoặc đã hết hạn");
        }

        u.setPasswordHash(encoder.encode(dto.getNewPassword()));
        userRepo.save(u);
    }
}
