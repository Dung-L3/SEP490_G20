package com.system.restaurant.management.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class UpdateOrderPhoneRequest {
    @NotBlank
    @Size(max = 20, message = "Số điện thoại tối đa 20 ký tự")
    private String phone;
}