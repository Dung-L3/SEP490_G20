package com.system.restaurant.management.repository;

import com.system.restaurant.management.entity.WorkShift;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface WorkShiftRepository extends JpaRepository<WorkShift, Integer> {

    List<WorkShift> findByUser_IdAndShiftDateBetween(
            Integer userId,
            LocalDate fromDate,
            LocalDate toDate
    );
}