package com.system.restaurant.management.controller;

import com.system.restaurant.management.dto.LoginRequest;
import com.system.restaurant.management.dto.LoginResponse;
import com.system.restaurant.management.entity.User;
import com.system.restaurant.management.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest) {
        User user = authService.login(loginRequest.getUsername(), loginRequest.getPassword());

        LoginResponse response = LoginResponse.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .message("Login successful")
                .build();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/validate")
    public ResponseEntity<Boolean> validateUser(@RequestBody LoginRequest loginRequest) {
        boolean isValid = authService.validateUser(loginRequest.getUsername(), loginRequest.getPassword());
        return ResponseEntity.ok(isValid);
    }
}