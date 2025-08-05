package com.system.restaurant.management.service.serviceImpl;

import com.system.restaurant.management.dto.UserRequestDto;
import com.system.restaurant.management.dto.UserResponseDTO;
import com.system.restaurant.management.entity.Role;
import com.system.restaurant.management.entity.User;
import com.system.restaurant.management.exception.ResourceNotFoundException;
import com.system.restaurant.management.repository.RoleRepository;
import com.system.restaurant.management.repository.UserRepository;
import com.system.restaurant.management.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private static final int CUSTOMER_ROLE_ID = 5;

    @Override
    public User create(UserRequestDto dto) {
        User user = new User();
        user.setFullName(dto.getFullName());
        user.setEmail(dto.getEmail());
        user.setPhone(dto.getPhone());
        user.setUsername(dto.getUsername());
        user.setStatus(dto.getStatus());
        user.setPasswordHash(dto.getPasswordHash());
        user.setCreatedAt(LocalDateTime.now());

        // Lấy danh sách role từ tên
        Set<Role> roles = dto.getRoleNames().stream()
                .map(name -> roleRepository.findByRoleName(name)
                        .orElseThrow(() -> new ResourceNotFoundException("Role", "roleName", name)))
                .collect(Collectors.toSet());

        user.setRoles(roles);

        return userRepository.save(user);
    }

    @Override
    public User findById(Integer id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }

    @Override
    public List<User> findAll() {
        return userRepository.findAll();
    }

    @Override
    public List<UserResponseDTO> findAllStaffs() {
        return userRepository
                .findAllWithoutRole(CUSTOMER_ROLE_ID)
                .stream()
                .map(UserResponseDTO::fromEntity)
                .toList();
    }

    @Override
    public User update(Integer id, UserRequestDto dto) {
        User user = findById(id);

        user.setFullName(dto.getFullName());
        user.setEmail(dto.getEmail());
        user.setPhone(dto.getPhone());
        user.setStatus(dto.getStatus());
        user.setUsername(dto.getUsername());

        // Nếu passwordHash được gửi lên thì mới cập nhật
        if (dto.getPasswordHash() != null) {
            user.setPasswordHash(dto.getPasswordHash());
        }

        // Cập nhật roles nếu có
        if (dto.getRoleNames() != null && !dto.getRoleNames().isEmpty()) {
            Set<Role> roles = dto.getRoleNames().stream()
                    .map(name -> roleRepository.findByRoleName(name)
                            .orElseThrow(() -> new ResourceNotFoundException("Role", "roleName", name)))
                    .collect(Collectors.toSet());
            user.setRoles(roles);
        }

        return userRepository.save(user);
    }


    @Override
    public User updateStatus(Integer id, boolean status) {
        User user = findById(id);
        user.setStatus(status);
        return userRepository.save(user);
    }

    @Override
    public void delete(Integer id) {
        User user = findById(id);
        userRepository.delete(user);
    }

    @Override
    public List<User> findByFullName(String fullName) {
        return userRepository.findByFullNameContainingIgnoreCase(fullName);
    }

    @Override
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }
}