package com.system.restaurant.management.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@AllArgsConstructor
public class ShiftAttendanceDTO {
    private LocalDate shiftDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private LocalDateTime clockIn;
    private LocalDateTime clockOut;
}