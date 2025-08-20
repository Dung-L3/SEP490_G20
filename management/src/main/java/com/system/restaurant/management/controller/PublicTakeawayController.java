package com.system.restaurant.management.controller;

import com.system.restaurant.management.dto.CreateTakeawayOrderRequest;
import com.system.restaurant.management.dto.TakeawayOrderResponse;
import com.system.restaurant.management.service.ReceptionistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicTakeawayController {

    private final ReceptionistService receptionistService;

    @PostMapping("/orders")
    public ResponseEntity<TakeawayOrderResponse> create(
            @Valid @RequestBody CreateTakeawayOrderRequest req) {
        return ResponseEntity.ok(receptionistService.createTakeawayOrder(req));
    }

    // (tuỳ chọn) Lấy các đơn TAKEAWAY đang chờ (để debug / dùng riêng)
    @GetMapping("/takeaway-orders/pending")
    public ResponseEntity<?> pending() {
        return ResponseEntity.ok(receptionistService.getPendingTakeawayOrders());
    }
}