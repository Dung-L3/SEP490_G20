package com.system.restaurant.management.controller;

import com.system.restaurant.management.dto.KitchenOrderDTO;
import com.system.restaurant.management.service.ChefService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ChefController {

    private final ChefService chefService;

    @GetMapping("/chef/orders/pending")
    public ResponseEntity<List<KitchenOrderDTO>> getPendingOrders() {
        return ResponseEntity.ok(chefService.getPendingOrders());
    }

    @PutMapping("/chef/orders/{orderDetailId}/status")
    public ResponseEntity<String> updateOrderStatus(
            @PathVariable Integer orderDetailId,
            @RequestParam String status) {
        try {
            chefService.updateOrderStatus(orderDetailId, status);
            return ResponseEntity.ok("Order status updated successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to update order status: " + e.getMessage());
        }
    }

    @PutMapping("/chef/orders/{orderDetailId}/cancel")
    public ResponseEntity<String> cancelOrder(@PathVariable Integer orderDetailId) {
        try {
            chefService.updateOrderStatus(orderDetailId, "CANCELLED");
            return ResponseEntity.ok("Order cancelled successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to cancel order: " + e.getMessage());
        }
    }
}
