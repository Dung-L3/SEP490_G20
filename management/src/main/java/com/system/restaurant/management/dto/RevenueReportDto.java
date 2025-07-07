package com.system.restaurant.management.dto;


import lombok.*;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RevenueReportDto {
    private String period;
    private long invoiceCount;
    private BigDecimal totalRevenue;
}