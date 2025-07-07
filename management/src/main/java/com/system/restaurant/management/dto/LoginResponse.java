package com.system.restaurant.management.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoginResponse {
    private Integer userId;
    private String username;
    private String fullName;
    private String email;
    private String message;
}