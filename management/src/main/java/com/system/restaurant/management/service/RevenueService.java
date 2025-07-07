package com.system.restaurant.management.service;

import com.system.restaurant.management.dto.RevenueReportDto;
import java.time.LocalDate;
import java.util.List;

public interface RevenueService {
    List<RevenueReportDto> getRevenueByShifts(LocalDate date);
    List<RevenueReportDto> getRevenueByDays(LocalDate fromDate, LocalDate toDate);
    List<RevenueReportDto> getRevenueByMonths(LocalDate fromDate, LocalDate toDate);
}
