package com.system.restaurant.management.service.serviceImpl;

import com.system.restaurant.management.dto.ShiftAttendanceDTO;
import com.system.restaurant.management.entity.AttendanceRecord;
import com.system.restaurant.management.entity.WorkShift;
import com.system.restaurant.management.repository.AttendanceRecordRepository;
import com.system.restaurant.management.repository.WorkShiftRepository;
import com.system.restaurant.management.service.ShiftAttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ShiftAttendanceServiceImpl implements ShiftAttendanceService {

    private final WorkShiftRepository workShiftRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;

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
}
