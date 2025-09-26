package com.system.restaurant.management.repository;

import com.system.restaurant.management.dto.RevenueReportDto;
import com.system.restaurant.management.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RevenueRepository extends JpaRepository<Invoice, Integer> {

    @Query(value = """
      SELECT 'Shift 1: Morning' AS period,
             COUNT(*)           AS invoiceCount,
             COALESCE(SUM(FinalTotal), 0) AS totalRevenue
      FROM Invoices
      WHERE CAST(IssuedAt AS date) = :date
        AND CAST(IssuedAt AS time) BETWEEN '00:01:00' AND '11:59:00'
      UNION ALL
      SELECT 'Shift 2: Afternoon',
             COUNT(*),
             COALESCE(SUM(FinalTotal), 0)
      FROM Invoices
      WHERE CAST(IssuedAt AS date) = :date
        AND CAST(IssuedAt AS time) BETWEEN '12:00:00' AND '17:59:00'
      UNION ALL
      SELECT 'Shift 3: Evening',
             COUNT(*),
             COALESCE(SUM(FinalTotal), 0)
      FROM Invoices
      WHERE CAST(IssuedAt AS date) = :date
        AND CAST(IssuedAt AS time) BETWEEN '18:00:00' AND '23:59:00'
    """, nativeQuery = true)
    List<RevenueReportDto> findByShifts(@Param("date") LocalDate date);

    @Query(value = """
      SELECT CONVERT(varchar(10), IssuedAt, 23) AS period,
             COUNT(*)                       AS invoiceCount,
             COALESCE(SUM(FinalTotal), 0)   AS totalRevenue
      FROM Invoices
      WHERE CAST(IssuedAt AS date) BETWEEN :fromDate AND :toDate
      GROUP BY CONVERT(varchar(10), IssuedAt, 23)
      ORDER BY period
    """, nativeQuery = true)
    List<RevenueReportDto> findByDayRange(
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate")   LocalDate toDate
    );

    @Query(value = """
      SELECT LEFT(CONVERT(varchar(7), IssuedAt, 23), 7) AS period,
             COUNT(*)                               AS invoiceCount,
             COALESCE(SUM(FinalTotal), 0)           AS totalRevenue
      FROM Invoices
      WHERE CAST(IssuedAt AS date) BETWEEN :fromDate AND :toDate
      GROUP BY LEFT(CONVERT(varchar(7), IssuedAt, 23), 7)
      ORDER BY period
    """, nativeQuery = true)
    List<RevenueReportDto> findByMonthRange(
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate")   LocalDate toDate
    );
}
