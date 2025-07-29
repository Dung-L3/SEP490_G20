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

    @PutMapping("/orders/{orderDetailId}/accept")
    public ResponseEntity<KitchenOrderDTO> acceptOrder(@PathVariable Integer orderDetailId) {
        return ResponseEntity.ok(chefService.acceptOrder(orderDetailId));
    }

    @PutMapping("/orders/{orderDetailId}/complete")
    public ResponseEntity<KitchenOrderDTO> completeOrder(@PathVariable Integer orderDetailId) {
        return ResponseEntity.ok(chefService.completeOrder(orderDetailId));
    }
}
