package com.system.restaurant.management.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserRequestDto {
    private String fullName;
    private String email;
    private String phone;
    private Boolean status;
    private String username;
    private String passwordHash;
    private List<String> roleNames;
}