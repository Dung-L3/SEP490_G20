package com.system.restaurant.management.service;

import com.system.restaurant.management.dto.PurchaseHistoryDto;
import com.system.restaurant.management.service.serviceImpl.ManagePurchaseHistoryServiceImpl;

import java.util.List;

public interface ManagePurchaseHistoryService{

     List<PurchaseHistoryDto> getAllHistory();
     List<PurchaseHistoryDto> getHistoryByCustomer(String cusPhone);
}
