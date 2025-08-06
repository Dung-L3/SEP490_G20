package com.system.restaurant.management.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PasswordResetDto {
    @NotBlank
    @Size(min = 6, max = 6)
    private String token;

    @NotBlank @Size(min = 8)
    private String newPassword;

    @NotBlank @Email
    private String email;
}
