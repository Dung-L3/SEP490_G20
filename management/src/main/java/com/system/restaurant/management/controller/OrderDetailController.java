package com.system.restaurant.management.controller;

import com.system.restaurant.management.dto.OrderDetailDTO;
import com.system.restaurant.management.service.OrderDetailService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderDetailController {

    private final OrderDetailService detailService;

    public OrderDetailController(OrderDetailService detailService) {
        this.detailService = detailService;
    }

    @GetMapping("/{orderId}/details")
    public List<OrderDetailDTO> getOrderDetails(@PathVariable Integer orderId) {
        return detailService.getOrderDetailsByOrderId(orderId);
    }
}
