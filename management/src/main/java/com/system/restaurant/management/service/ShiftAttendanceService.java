package com.system.restaurant.management.service;

import com.system.restaurant.management.dto.ShiftAttendanceDTO;
import java.time.LocalDate;
import java.util.List;

public interface ShiftAttendanceService {
    List<ShiftAttendanceDTO> getShiftAttendances(
            Integer userId,
            LocalDate fromDate,
            LocalDate toDate
    );
}