package com.system.restaurant.management.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class StaffRequestDto {
    private String fullName;
    private String email;
    private String phone;
    private Boolean status;
    private String role;
    private String username;
}