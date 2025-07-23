package com.system.restaurant.management.service.serviceImpl;

import com.system.restaurant.management.dto.StaffRequestDto;
import com.system.restaurant.management.entity.Staff;
import com.system.restaurant.management.exception.ResourceNotFoundException;
import com.system.restaurant.management.repository.StaffRepository;
import com.system.restaurant.management.service.StaffService;
import jakarta.persistence.EntityNotFoundException;
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
    public Staff findById(Integer id) {
        return staffRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff", "id", id));
    }

    @Override
    public List<Staff> findAll() {
        return staffRepository.findAll();
    }

    @Override
    public Staff update(Integer staffId, StaffRequestDto dto) {
        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new EntityNotFoundException("Staff not found"));

        staff.setFullName(dto.getFullName());
        staff.setEmail(dto.getEmail());
        staff.setPhone(dto.getPhone());
        staff.setStatus(dto.getStatus());
        staff.setRole(dto.getRole());
        staff.setUsername(dto.getUsername());

        return staffRepository.save(staff);
    }

    @Override
    public Staff updateStatus(Integer id, boolean status) {
        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Staff not found"));
        staff.setStatus(status);
        return staffRepository.save(staff);
    }


    @Override
    public void delete(Integer id) {
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