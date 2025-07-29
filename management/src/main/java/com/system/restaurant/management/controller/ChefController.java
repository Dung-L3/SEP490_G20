package com.system.restaurant.management.controller;

import com.system.restaurant.management.dto.KitchenOrderDTO;
import com.system.restaurant.management.service.ChefService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chef")
@RequiredArgsConstructor
@CrossOrigin
public class ChefController {
    private final ChefService chefService;

    @GetMapping("/orders")
    public ResponseEntity<List<KitchenOrderDTO>> getAllPendingOrders() {
        return ResponseEntity.ok(chefService.getPendingOrders());
    }

    @GetMapping("/orders/cooking")
    public ResponseEntity<List<KitchenOrderDTO>> getCookingOrders() {
        return ResponseEntity.ok(chefService.getCookingOrders());
    }

    @PutMapping("/orders/{orderDetailId}/status")
    public ResponseEntity<KitchenOrderDTO> updateOrderStatus(
            @PathVariable Integer orderDetailId,
            @RequestParam Integer statusId) {
        return ResponseEntity.ok(chefService.updateOrderStatus(orderDetailId, statusId));
    }
}
