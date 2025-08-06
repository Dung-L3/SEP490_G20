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

    @GetMapping("/customer/{phone}")
    public ResponseEntity<List<PurchaseHistoryDto>> getHistoryByPhone(@PathVariable String phone) {
        List<PurchaseHistoryDto> history = managePurchaseHistoryService.getHistoryByPhone(phone);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/statistics/{phone}")
    public ResponseEntity<PurchaseHistoryResponse> getCustomerStatistics(@PathVariable String phone) {
        PurchaseHistoryResponse statistics = managePurchaseHistoryService.getCustomerStatistics(phone);
        return ResponseEntity.ok(statistics);
    }
}