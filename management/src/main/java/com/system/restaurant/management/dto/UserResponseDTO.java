package com.system.restaurant.management.dto;

import com.system.restaurant.management.entity.Role;
import com.system.restaurant.management.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserResponseDTO {
    private Integer id;
    private String username;
    private String fullName;
    private String email;
    private String phone;
    private Boolean status;
    private LocalDateTime createdAt;
    private String roleName;

    public static UserResponseDTO fromEntity(User u) {
        UserResponseDTO dto = new UserResponseDTO();
        dto.setId(u.getId());
        dto.setUsername(u.getUsername());
        dto.setFullName(u.getFullName());
        dto.setEmail(u.getEmail());
        dto.setPhone(u.getPhone());
        dto.setStatus(u.getStatus());
        dto.setCreatedAt(u.getCreatedAt());

        String rn = u.getRoles()
                .stream()
                .findFirst()
                .map(Role::getRoleName)
                .orElse(null);
        dto.setRoleName(rn);
        return dto;
    }

}

