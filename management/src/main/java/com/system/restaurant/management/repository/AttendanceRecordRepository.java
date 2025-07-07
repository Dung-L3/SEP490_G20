package com.system.restaurant.management.repository;

import com.system.restaurant.management.entity.AttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Integer> {
    List<AttendanceRecord> findByUser_IdAndClockInBetween(
            Integer userId,
            LocalDateTime start,
            LocalDateTime end
    );
}