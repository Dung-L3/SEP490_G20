package com.system.restaurant.management.controller;

import com.system.restaurant.management.dto.OrderRequestDto;
import com.system.restaurant.management.entity.Order;
import com.system.restaurant.management.service.ReceptionistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/receptionist/orders")
public class OrderController {

    private final ReceptionistService receptionistService;

    @Autowired
    public OrderController(ReceptionistService receptionistService) {
        this.receptionistService = receptionistService;
    }

    @PostMapping
    public ResponseEntity<Order> placeTakeawayOrder(@RequestBody OrderRequestDto orderDto) {
        Order savedOrder = receptionistService.placeTakeawayOrder(orderDto);
        return ResponseEntity.ok(savedOrder);
    }

}
