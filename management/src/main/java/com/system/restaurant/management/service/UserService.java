package com.system.restaurant.management.service;

import com.system.restaurant.management.dto.UserRequestDto;
import com.system.restaurant.management.dto.UserResponseDTO;
import com.system.restaurant.management.entity.User;

import java.util.List;

public interface UserService {
    User create(UserRequestDto dto);
    User findById(Integer id);
    List<User> findAll();
    List<UserResponseDTO> findAllStaffs();
    User update(Integer id, UserRequestDto dto);
    User updateStatus(Integer id, boolean status);
    void delete(Integer id);
    List<User> findByFullName(String fullName);
    boolean existsByUsername(String username);
}