package com.system.restaurant.management.service.serviceImpl;

import com.system.restaurant.management.dto.ShiftAttendanceDTO;
import com.system.restaurant.management.dto.WorkShiftRequest;
import com.system.restaurant.management.entity.AttendanceRecord;
import com.system.restaurant.management.entity.User;
import com.system.restaurant.management.entity.WorkShift;
import com.system.restaurant.management.repository.AttendanceRecordRepository;
import com.system.restaurant.management.repository.UserRepository;
import com.system.restaurant.management.repository.WorkShiftRepository;
import com.system.restaurant.management.service.ShiftAttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ShiftAttendanceServiceImpl implements ShiftAttendanceService {

    private final WorkShiftRepository workShiftRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final UserRepository userRepository;

    @Override
    public List<ShiftAttendanceDTO> getShiftAttendances(
            Integer userId,
            LocalDate fromDate,
            LocalDate toDate
    ) {
        List<WorkShift> shifts = workShiftRepository.findByUser_IdAndShiftDateBetween(
                userId, fromDate, toDate
        );
        LocalDateTime startOfDay = fromDate.atStartOfDay();
        LocalDateTime endOfDay   = toDate.plusDays(1).atStartOfDay();
        List<AttendanceRecord> records = attendanceRecordRepository.findByUser_IdAndClockInBetween(
                userId, startOfDay, endOfDay
        );

        Map<LocalDate, AttendanceRecord> recordMap = new HashMap<>();
        for (AttendanceRecord rec : records) {
            LocalDate date = rec.getClockIn().toLocalDate();
            recordMap.putIfAbsent(date, rec);
        }

        List<ShiftAttendanceDTO> result = new ArrayList<>();
        for (WorkShift ws : shifts) {
            AttendanceRecord ar = recordMap.get(ws.getShiftDate());
            ShiftAttendanceDTO dto = new ShiftAttendanceDTO(
                    ws.getShiftDate(),
                    ws.getStartTime(),
                    ws.getEndTime(),
                    ar != null ? ar.getClockIn()  : null,
                    ar != null ? ar.getClockOut() : null
            );
            result.add(dto);
        }
        return result;
    }

    @Override
    @Transactional
    public WorkShift createWorkShift(WorkShiftRequest req) {
        User user = userRepository.findById(req.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + req.getUserId()));

        WorkShift ws = new WorkShift();
        ws.setUser(user);
        ws.setShiftDate(req.getShiftDate());
        ws.setStartTime(req.getStartTime());
        ws.setEndTime(req.getEndTime());
        ws.setHandOverTo(req.getHandoverTo());
        ws.setHandOverNotes(req.getHandoverNotes());
        ws.setIsOverNight(computeIsOverNight(req.getEndTime()));

        return workShiftRepository.save(ws);
    }

    @Override
    @Transactional
    public WorkShift updateWorkShift(Integer shiftId, WorkShiftRequest req) {
        WorkShift ws = workShiftRepository.findById(shiftId)
                .orElseThrow(() -> new IllegalArgumentException("Shift not found: " + shiftId));
        User user = userRepository.findById(req.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + req.getUserId()));

        ws.setUser(user);
        ws.setShiftDate(req.getShiftDate());
        ws.setStartTime(req.getStartTime());
        ws.setEndTime(req.getEndTime());
        ws.setHandOverTo(req.getHandoverTo());
        ws.setHandOverNotes(req.getHandoverNotes());
        ws.setIsOverNight(computeIsOverNight(req.getEndTime()));

        return workShiftRepository.save(ws);
    }

    private int computeIsOverNight(LocalTime endTime) {
        return endTime.isAfter(LocalTime.of(22, 0)) ? 1 : 0;
    }
}
