package com.system.restaurant.management.service;

import com.system.restaurant.management.dto.ShiftAttendanceDTO;
import com.system.restaurant.management.dto.WorkShiftRequest;
import com.system.restaurant.management.entity.WorkShift;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface ShiftAttendanceService {
    List<ShiftAttendanceDTO> getAllShiftAttendances(
    );

    WorkShift createWorkShift(WorkShiftRequest request);
    WorkShift updateWorkShift(Integer shiftId, WorkShiftRequest request);
}