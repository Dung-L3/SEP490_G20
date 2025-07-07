package com.system.restaurant.management.controller;

import com.system.restaurant.management.dto.PurchaseHistoryDto;
import com.system.restaurant.management.service.ManagePurchaseHistoryService;
import com.system.restaurant.management.service.ManageTableService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/purchase-history")
@RequiredArgsConstructor
public class ManagePurchaseHistoryController {
    private final ManagePurchaseHistoryService historyService;

    @GetMapping("/getAll")
    public List<PurchaseHistoryDto> all() {
        return historyService.getAllHistory();
    }

    @GetMapping("/customer/{cusPhone}")
    public List<PurchaseHistoryDto> getPurchaseCustomerByPhone(@PathVariable String cusPhone) {
        return historyService.getHistoryByCustomer(cusPhone);
    }
}
