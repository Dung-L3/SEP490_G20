package com.system.restaurant.management.repository;

import com.system.restaurant.management.entity.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StaffRepository extends JpaRepository<Staff, Long> {
    List<Staff> findByFullNameContainingIgnoreCase(String fullName);
    boolean existsByUsername(String username);
}
