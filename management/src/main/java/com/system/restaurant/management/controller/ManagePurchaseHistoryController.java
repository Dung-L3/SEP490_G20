package com.system.restaurant.management.controller;

import com.system.restaurant.management.dto.PurchaseHistoryDto;
import com.system.restaurant.management.dto.PurchaseHistoryResponse;
import com.system.restaurant.management.service.ManagePurchaseHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/purchase-history")
@RequiredArgsConstructor
public class ManagePurchaseHistoryController {

    private final ManagePurchaseHistoryService managePurchaseHistoryService;

    @GetMapping("/all")
    public ResponseEntity<List<PurchaseHistoryDto>> getAllHistory() {
        List<PurchaseHistoryDto> history = managePurchaseHistoryService.getAllHistory();
        return ResponseEntity.ok(history);
    }

    @GetMapping("/phone/{phone}")
    public ResponseEntity<List<PurchaseHistoryDto>> getHistoryByPhone(@PathVariable String phone) {
        List<PurchaseHistoryDto> history = managePurchaseHistoryService.getHistoryByPhone(phone);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/customer/{customerName}")
    public ResponseEntity<List<PurchaseHistoryDto>> getHistoryByCustomerName(@PathVariable String customerName) {
        List<PurchaseHistoryDto> history = managePurchaseHistoryService.getHistoryByCustomerName(customerName);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<PurchaseHistoryDto>> getHistoryByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<PurchaseHistoryDto> history = managePurchaseHistoryService.getHistoryByDateRange(startDate, endDate);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/order-type/{orderType}")
    public ResponseEntity<List<PurchaseHistoryDto>> getHistoryByOrderType(@PathVariable String orderType) {
        List<PurchaseHistoryDto> history = managePurchaseHistoryService.getHistoryByOrderType(orderType);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/statistics/{phone}")
    public ResponseEntity<PurchaseHistoryResponse> getCustomerStatistics(@PathVariable String phone) {
        PurchaseHistoryResponse statistics = managePurchaseHistoryService.getCustomerStatistics(phone);
        return ResponseEntity.ok(statistics);
    }
}