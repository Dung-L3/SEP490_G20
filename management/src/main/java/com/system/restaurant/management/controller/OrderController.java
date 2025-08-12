package com.system.restaurant.management.controller;

import com.system.restaurant.management.dto.*;
import com.system.restaurant.management.service.OrderService;
import com.system.restaurant.management.service.ReceptionistService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/receptionist/orders")
public class OrderController {

    private final ReceptionistService receptionistService;
    private final OrderService orderService;

    @Autowired
    public OrderController(ReceptionistService receptionistService, OrderService orderService) {
        this.receptionistService = receptionistService;
        this.orderService = orderService;
    }

    @PostMapping("/takeaway")
    public ResponseEntity<TakeawayOrderResponse> createTakeawayOrder(
            @RequestBody CreateTakeawayOrderRequest request) {
        TakeawayOrderResponse response = receptionistService.createTakeawayOrder(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/unpaid")
    public List<OrderDto> getUnpaidOrders() {
        return orderService.getUnpaidOrders();
    }

    @GetMapping("{id}")
    public ResponseEntity<OrderDto> getOrder(@PathVariable Integer id) {
        return ResponseEntity.ok(orderService.findById(id));
    }

    @PatchMapping("/{orderId}/phone")
    public ResponseEntity<Void> updatePhone(
            @PathVariable Integer orderId,
            @RequestBody @Valid UpdateOrderPhoneRequest req
    ) {
        orderService.updateOrderPhone(orderId, req.getPhone());
        return ResponseEntity.noContent().build();
    }
}
