package com.system.restaurant.management.service.serviceImpl;

import com.system.restaurant.management.entity.Staff;
import com.system.restaurant.management.exception.ResourceNotFoundException;
import com.system.restaurant.management.repository.StaffRepository;
import com.system.restaurant.management.service.StaffService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StaffServiceImpl implements StaffService {

    private final StaffRepository staffRepository;

    @Override
    public Staff create(Staff staff) {
        staff.setCreatedAt(LocalDateTime.now());
        return staffRepository.save(staff);
    }

    @Override
    public Staff findById(Long id) {
        return staffRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff", "id", id));
    }

    @Override
    public List<Staff> findAll() {
        return staffRepository.findAll();
    }

    @Override
    public Staff update(Long id, Staff updatedStaff) {
        Staff staff = findById(id);
        staff.setFullName(updatedStaff.getFullName());
        staff.setUsername(updatedStaff.getUsername());
        staff.setEmail(updatedStaff.getEmail());
        staff.setPhone(updatedStaff.getPhone());
        staff.setStatus(updatedStaff.getStatus());
        return staffRepository.save(staff);
    }

    @Override
    public void delete(Long id) {
        Staff staff = findById(id);
        staffRepository.delete(staff);
    }

    @Override
    public List<Staff> findByFullName(String fullName) {
        return staffRepository.findByFullNameContainingIgnoreCase(fullName);
    }

    @Override
    public boolean existsByUsername(String username) {
        return staffRepository.existsByUsername(username);
    }
}
