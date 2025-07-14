package com.system.restaurant.management.service;

import com.system.restaurant.management.dto.StaffRequestDto;
import com.system.restaurant.management.entity.Staff;

import java.util.List;

public interface StaffService {
    Staff create(Staff staff);
    Staff findById(Integer id);
    List<Staff> findAll();
    Staff update(Integer id, StaffRequestDto dto);
    Staff updateStatus(Integer id, boolean status);
    void delete(Integer id);
    List<Staff> findByFullName(String fullName);
    boolean existsByUsername(String username);
}