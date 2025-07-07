package com.system.restaurant.management.service.serviceImpl;

import com.system.restaurant.management.dto.RevenueReportDto;
import com.system.restaurant.management.repository.RevenueRepository;
import com.system.restaurant.management.service.RevenueService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RevenueServiceImpl implements RevenueService {
    private final RevenueRepository repo;

    @Override
    public List<RevenueReportDto> getRevenueByShifts(LocalDate date) {
        return repo.findByShifts(date);
    }

    @Override
    public List<RevenueReportDto> getRevenueByDays(LocalDate fromDate, LocalDate toDate) {
        return repo.findByDayRange(fromDate, toDate);
    }

    @Override
    public List<RevenueReportDto> getRevenueByMonths(LocalDate fromDate, LocalDate toDate) {
        return repo.findByMonthRange(fromDate, toDate);
    }
}

