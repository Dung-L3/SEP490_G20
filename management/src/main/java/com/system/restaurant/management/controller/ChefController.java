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
}
