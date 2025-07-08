package com.system.restaurant.management.service;

import com.system.restaurant.management.dto.PurchaseHistoryDto;
import com.system.restaurant.management.dto.PurchaseHistoryResponse;
import java.time.LocalDateTime;
import java.util.List;

public interface ManagePurchaseHistoryService {

     List<PurchaseHistoryDto> getAllHistory();
     List<PurchaseHistoryDto> getHistoryByCustomer(String cusPhone);

     List<PurchaseHistoryDto> getPurchaseHistoryByPhone(String phone);
     List<PurchaseHistoryDto> getPurchaseHistoryByCustomerName(String customerName);
     List<PurchaseHistoryDto> getPurchaseHistoryByDateRange(LocalDateTime startDate, LocalDateTime endDate);
     List<PurchaseHistoryDto> getPurchaseHistoryByOrderType(String orderType);

     // Thống kê và báo cáo
     PurchaseHistoryResponse getCustomerStatistics(String phone);
     List<Object[]> getTopCustomers();
     List<Object[]> getMonthlyStatistics();
}