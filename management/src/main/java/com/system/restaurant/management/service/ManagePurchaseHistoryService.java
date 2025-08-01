package com.system.restaurant.management.service;

import com.system.restaurant.management.dto.PurchaseHistoryDto;
import com.system.restaurant.management.dto.PurchaseHistoryResponse;

import java.time.LocalDateTime;
import java.util.List;

public interface ManagePurchaseHistoryService {
     List<PurchaseHistoryDto> getAllHistory();
     List<PurchaseHistoryDto> getHistoryByPhone(String phone);
     PurchaseHistoryResponse getCustomerStatistics(String phone);
}