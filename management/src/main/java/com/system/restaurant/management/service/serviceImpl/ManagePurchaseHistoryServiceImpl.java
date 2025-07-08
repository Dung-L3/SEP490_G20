package com.system.restaurant.management.service.serviceImpl;

import com.system.restaurant.management.dto.PurchaseHistoryDto;
import com.system.restaurant.management.dto.PurchaseHistoryResponse;
import com.system.restaurant.management.repository.PurchaseHistoryRepository;
import com.system.restaurant.management.service.ManagePurchaseHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ManagePurchaseHistoryServiceImpl implements ManagePurchaseHistoryService {

    private final PurchaseHistoryRepository purchaseHistoryRepository;

    @Override
    public List<PurchaseHistoryDto> getAllHistory() {
        return purchaseHistoryRepository.findAllHistory();
    }

    @Override
    public List<PurchaseHistoryDto> getHistoryByPhone(String phone) {
        return purchaseHistoryRepository.findHistoryByPhone(phone);
    }

    @Override
    public List<PurchaseHistoryDto> getHistoryByCustomerName(String customerName) {
        return purchaseHistoryRepository.findHistoryByCustomerName(customerName);
    }

    @Override
    public List<PurchaseHistoryDto> getHistoryByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return purchaseHistoryRepository.findHistoryByDateRange(startDate, endDate);
    }

    @Override
    public List<PurchaseHistoryDto> getHistoryByOrderType(String orderType) {
        return purchaseHistoryRepository.findHistoryByOrderType(orderType);
    }

    @Override
    public PurchaseHistoryResponse getCustomerStatistics(String phone) {
        List<PurchaseHistoryDto> customerHistory = getHistoryByPhone(phone);

        if (customerHistory.isEmpty()) {
            return PurchaseHistoryResponse.builder()
                    .customerPhone(phone)
                    .customerName("Unknown")
                    .totalOrders(0)
                    .totalSpent(BigDecimal.ZERO)
                    .purchaseHistory(customerHistory)
                    .build();
        }

        BigDecimal totalSpent = customerHistory.stream()
                .map(PurchaseHistoryDto::getFinalTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return PurchaseHistoryResponse.builder()
                .customerPhone(phone)
                .customerName(customerHistory.get(0).getCustomerName())
                .totalOrders(customerHistory.size())
                .totalSpent(totalSpent)
                .purchaseHistory(customerHistory)
                .build();
    }
}