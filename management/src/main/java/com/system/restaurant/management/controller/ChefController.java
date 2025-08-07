package com.system.restaurant.management.controller;

import com.system.restaurant.management.service.serviceImpl.ChefServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chef")
public class ChefController {

    private final ChefServiceImpl chefService;

    @Autowired
    public ChefController(ChefServiceImpl chefService) {
        this.chefService = chefService;
    }

    @GetMapping("/orders/pending")
    public ResponseEntity<List<Map<String, Object>>> getPendingOrders() {
        try {
            List<Map<String, Object>> orders = chefService.getPendingKitchenOrders();
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            System.err.println("Error getting pending orders: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/orders/{orderDetailId}/status")
    public ResponseEntity<String> updateOrderStatus(
            @PathVariable Integer orderDetailId,
            @RequestParam String status) {
        try {
            chefService.updateOrderDetailStatus(orderDetailId, status);
            return ResponseEntity.ok("Order status updated successfully");
        } catch (Exception e) {
            System.err.println("Error updating order status: " + e.getMessage());
            return ResponseEntity.badRequest().body("Failed to update order status: " + e.getMessage());
        }
    }
}
