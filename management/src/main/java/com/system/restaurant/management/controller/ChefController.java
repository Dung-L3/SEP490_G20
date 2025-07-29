package com.system.restaurant.management.controller;

import com.system.restaurant.management.dto.KitchenOrderDTO;
import com.system.restaurant.management.exception.ResourceNotFoundException;
import com.system.restaurant.management.service.ChefService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ChefController {

    private final ChefService chefService;

    @GetMapping("/chef/orders/pending")
    public ResponseEntity<List<KitchenOrderDTO>> getPendingOrders() {
        return ResponseEntity.ok(chefService.getPendingOrders());
    }

    @GetMapping("/chef/orders/cooking")
    public ResponseEntity<List<KitchenOrderDTO>> getCookingOrders() {
        return ResponseEntity.ok(chefService.getCookingOrders());
    }

    @PutMapping("/chef/orders/{orderDetailId}/processing")
    public ResponseEntity<?> markAsProcessing(@PathVariable int orderDetailId) {
        try {
            KitchenOrderDTO result = chefService.updateOrderStatus(orderDetailId, 2);
            return ResponseEntity.ok(result);
        } catch (ResourceNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "status", "NOT_FOUND",
                    "message", ex.getMessage()
            ));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "status", "ERROR",
                    "message", "Unexpected error occurred"
            ));
        }
    }

    @PutMapping("/chef/orders/{orderDetailId}/completed")
    public ResponseEntity<?> markAsCompleted(@PathVariable int orderDetailId) {
        try {
            KitchenOrderDTO result = chefService.updateOrderStatus(orderDetailId, 3);
            return ResponseEntity.ok(result);
        } catch (ResourceNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "status", "NOT_FOUND",
                    "message", ex.getMessage()
            ));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "status", "ERROR",
                    "message", "Unexpected error occurred"
            ));
        }
    }
}
