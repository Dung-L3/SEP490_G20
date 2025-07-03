package com.system.restaurant.management.service;

import com.system.restaurant.management.entity.Staff;

import java.util.List;

public interface StaffService {
    Staff create(Staff staff);
    Staff findById(Long id);
    List<Staff> findAll();
    Staff update(Long id, Staff staff);
    void delete(Long id);
    List<Staff> findByFullName(String fullName);
    boolean existsByUsername(String username);
}
