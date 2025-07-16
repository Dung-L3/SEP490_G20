package com.system.restaurant.management.controller;

import com.system.restaurant.management.dto.StaffRequestDto;
import com.system.restaurant.management.entity.Staff;
import com.system.restaurant.management.service.StaffService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/staffs")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StaffController {

    private final StaffService staffService;

    /**
     * Lấy danh sách tất cả nhân viên
     * GET /api/staffs
     */
    @GetMapping
    public ResponseEntity<List<Staff>> getAllStaffs() {
        return ResponseEntity.ok(staffService.findAll());
    }

    /**
     * Lấy thông tin nhân viên theo ID
     * GET /api/staffs/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Staff> getStaffById(@PathVariable Integer id) {
        return ResponseEntity.ok(staffService.findById(id));
    }

    /**
     * Tạo mới nhân viên
     * POST /api/staffs
     */
    @PostMapping
    public ResponseEntity<Staff> createStaff(@RequestBody Staff staff) {
        Staff created = staffService.create(staff);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Cập nhật thông tin nhân viên
     * PUT /api/staffs/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<Staff> updateStaff(@PathVariable Integer id, @RequestBody StaffRequestDto staff) {
        return ResponseEntity.ok(staffService.update(id, staff));
    }

    /**
     * Xóa nhân viên
     * DELETE /api/staffs/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStaff(@PathVariable Integer id) {
        staffService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Tìm kiếm nhân viên theo tên
     * GET /api/staffs/search?name={fullName}
     */
    @GetMapping("/search")
    public ResponseEntity<List<Staff>> searchStaffsByName(@RequestParam String name) {
        return ResponseEntity.ok(staffService.findByFullName(name));
    }

    /**
     * Kiểm tra username đã tồn tại
     * GET /api/staffs/exists?username={username}
     */
    @GetMapping("/exists")
    public ResponseEntity<Boolean> checkUsernameExists(@RequestParam String username) {
        return ResponseEntity.ok(staffService.existsByUsername(username));
    }

    /**
     * Cập nhật trạng thái nhân viên
     * PATCH /api/staffs/{id}/status
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<Staff> updateStatus(@PathVariable Integer id, @RequestParam boolean status) {
        return ResponseEntity.ok(staffService.updateStatus(id, status));
    }

}