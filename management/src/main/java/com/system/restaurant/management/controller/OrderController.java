package com.system.restaurant.management.controller;

import com.system.restaurant.management.dto.OrderDto;
import com.system.restaurant.management.dto.OrderRequestDto;
import com.system.restaurant.management.service.OrderService;
import com.system.restaurant.management.service.ReceptionistService;
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

    @PostMapping
    public ResponseEntity<OrderRequestDto> placeTakeawayOrder(@RequestBody OrderRequestDto orderDto) {
        OrderRequestDto savedOrder = receptionistService.placeTakeawayOrder(orderDto);
        return ResponseEntity.ok(savedOrder);
    }

    @GetMapping("/unpaid")
    public List<OrderDto> getUnpaidOrders() {
        return orderService.getUnpaidOrders();
    }

    @GetMapping("{id}")
    public ResponseEntity<OrderDto> getOrder(@PathVariable Integer id) {
        return ResponseEntity.ok(orderService.findById(id));
    }
}
