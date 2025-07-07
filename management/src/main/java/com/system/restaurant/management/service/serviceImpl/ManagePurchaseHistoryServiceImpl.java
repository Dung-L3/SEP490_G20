package com.system.restaurant.management.service.serviceImpl;

import com.system.restaurant.management.dto.PurchaseHistoryDto;
import com.system.restaurant.management.repository.PurchaseHistoryRepository;
import com.system.restaurant.management.service.ManagePurchaseHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ManagePurchaseHistoryServiceImpl implements ManagePurchaseHistoryService {
    private final PurchaseHistoryRepository historyRepo;

    public List<PurchaseHistoryDto> getAllHistory() {
        return historyRepo.findAllHistory();
    }

    public List<PurchaseHistoryDto> getHistoryByCustomer(String cusPhone) {
        return historyRepo.findHistoryByPhone(cusPhone);
    }
}
