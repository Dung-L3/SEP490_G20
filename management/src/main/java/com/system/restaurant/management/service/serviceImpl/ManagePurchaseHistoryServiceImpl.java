package com.system.restaurant.management.service.serviceImpl;

import com.system.restaurant.management.dto.PurchaseHistoryDto;
import com.system.restaurant.management.dto.PurchaseHistoryResponse;
import com.system.restaurant.management.repository.PurchaseHistoryRepository;
import com.system.restaurant.management.service.ManagePurchaseHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ManagePurchaseHistoryServiceImpl implements ManagePurchaseHistoryService {

    private final PurchaseHistoryRepository purchaseHistoryRepository;

    @Override
    public List<PurchaseHistoryDto> getAllHistory() {
        return purchaseHistoryRepository.findAllHistory();
    }

    @Override
    public List<PurchaseHistoryDto> getHistoryByCustomer(String cusPhone) {
        return purchaseHistoryRepository.findHistoryByPhone(cusPhone);
    }

    @Override
    public List<PurchaseHistoryDto> getPurchaseHistoryByPhone(String phone) {
        return purchaseHistoryRepository.findHistoryByPhone(phone);
    }

    @Override
    public List<PurchaseHistoryDto> getPurchaseHistoryByCustomerName(String customerName) {
        return purchaseHistoryRepository.findHistoryByCustomerName(customerName);
    }

    @Override
    public List<PurchaseHistoryDto> getPurchaseHistoryByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return purchaseHistoryRepository.findHistoryByDateRange(startDate, endDate);
    }

    @Override
    public List<PurchaseHistoryDto> getPurchaseHistoryByOrderType(String orderType) {
        return purchaseHistoryRepository.findHistoryByOrderType(orderType);
    }

    @Override
    public PurchaseHistoryResponse getCustomerStatistics(String phone) {
        List<PurchaseHistoryDto> customerHistory = getPurchaseHistoryByPhone(phone);

        if (customerHistory.isEmpty()) {
            return PurchaseHistoryResponse.builder()
                    .customerPhone(phone)
                    .totalOrders(0)
                    .totalSpent(BigDecimal.ZERO)
                    .purchaseHistory(List.of())
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

    @Override
    public List<Object[]> getTopCustomers() {
        return purchaseHistoryRepository.findTopCustomersByTotalSpent();
    }

    @Override
    public List<Object[]> getMonthlyStatistics() {
        return purchaseHistoryRepository.findMonthlyStatistics();
    }
}