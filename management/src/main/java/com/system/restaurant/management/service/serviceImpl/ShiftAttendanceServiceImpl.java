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
    public List<ShiftAttendanceDTO> getAllShiftAttendances() {
        List<WorkShift> shifts = workShiftRepository.findAll();

        List<AttendanceRecord> records = attendanceRecordRepository.findAll();

        Map<String, AttendanceRecord> recordMap = new HashMap<>();
        for (AttendanceRecord ar : records) {
            String key = ar.getUser().getId() + "_" + ar.getClockIn().toLocalDate();
            recordMap.putIfAbsent(key, ar);
        }

        List<ShiftAttendanceDTO> result = new ArrayList<>();
        for (WorkShift ws : shifts) {
            String key = ws.getUser().getId() + "_" + ws.getShiftDate();
            AttendanceRecord ar = recordMap.get(key);

            LocalDateTime in  = ar != null ? ar.getClockIn() : null;
            LocalDateTime out = ar != null ? ar.getClockOut(): null;

            result.add(new ShiftAttendanceDTO(
                    ws.getShiftId(),
                    ws.getShiftDate(),
                    ws.getStartTime(),
                    ws.getEndTime(),
                    in,
                    out,
                    ws.getIsOverNight(),
                    ws.getUser().getUsername()
            ));
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
