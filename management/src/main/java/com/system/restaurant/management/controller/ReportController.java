package com.system.restaurant.management.controller;

import com.system.restaurant.management.dto.RevenueReportDto;
import com.system.restaurant.management.dto.ShiftAttendanceDTO;
import com.system.restaurant.management.dto.WorkShiftRequest;
import com.system.restaurant.management.entity.WorkShift;
import com.system.restaurant.management.service.RevenueService;
import com.system.restaurant.management.service.ShiftAttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {
    private final RevenueService service;
    private final ShiftAttendanceService shiftAttendanceService;

    @GetMapping("/revenue/shifts")
    public ResponseEntity<List<RevenueReportDto>> byShifts(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(service.getRevenueByShifts(date));
    }

    @GetMapping("/revenue/daily")
    public ResponseEntity<List<RevenueReportDto>> byDays(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(service.getRevenueByDays(from, to));
    }

    @GetMapping("/revenue/monthly")
    public ResponseEntity<List<RevenueReportDto>> byMonths(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(service.getRevenueByMonths(from, to));
    }

    @GetMapping("/shift/attendance/staff")
    public List<ShiftAttendanceDTO> getShifts(
    ) {
        return shiftAttendanceService.getAllShiftAttendances();
    }

    @PostMapping("/create/shift")
    public ResponseEntity<WorkShift> createWorkShift(
            @RequestBody WorkShiftRequest request
    ) {
        return ResponseEntity.ok(shiftAttendanceService.createWorkShift(request));
    }

    @PutMapping("/update/shift/{shiftId}")
    public ResponseEntity<WorkShift> updateWorkShift(
            @PathVariable Integer shiftId,
            @RequestBody WorkShiftRequest request
    ) {
        return ResponseEntity.ok(shiftAttendanceService.updateWorkShift(shiftId, request));
    }
}