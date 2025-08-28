package com.system.restaurant.management.dto;

import com.system.restaurant.management.entity.Customer;
import com.system.restaurant.management.entity.Role;
import com.system.restaurant.management.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CustomerResponseDto {
    private Integer customerId;
    private String fullName;
    private String email;
    private String phone;
    private Integer LoyatyPoints;
    private LocalDate MemberSince;

    public static CustomerResponseDto fromEntity(Customer c) {
        CustomerResponseDto dto = new CustomerResponseDto();
        dto.setCustomerId(c.getCustomerId());
        dto.setFullName(c.getFullName());
        dto.setEmail(c.getEmail());
        dto.setPhone(c.getPhone());
        dto.setLoyatyPoints(c.getLoyaltyPoints());
        dto.setMemberSince(c.getMemberSince());
        return dto;
    }
}

