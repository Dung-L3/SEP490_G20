package com.system.restaurant.management.controller;

import com.system.restaurant.management.dto.TableOrderRequest;
import com.system.restaurant.management.dto.TableOrderResponse;
import com.system.restaurant.management.entity.Order;
import com.system.restaurant.management.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/tables")
@RequiredArgsConstructor
public class TableOrderController {
    private final OrderService orderService;
    // get all orders
    @GetMapping("/{tableId}/active-orders")
    public ResponseEntity<List<Order>> getActiveOrdersByTable(@PathVariable Integer tableId) {
        // Status 1 = Pending, 2 = Processing
        List<Integer> activeStatuses = Arrays.asList(1, 2);
        List<Order> activeOrders = orderService.getOrdersByTableAndStatuses(tableId, activeStatuses);
        return ResponseEntity.ok(activeOrders);
    }
    // get all orders
    @PostMapping("/{tableId}/orders")
    public ResponseEntity<TableOrderResponse> addTableOrderItem(
            @PathVariable Integer tableId,
            @Valid @RequestBody TableOrderRequest request) {
        request.setTableId(tableId);
        return ResponseEntity.ok(orderService.addTableOrderItem(request));
    }
    //update an existing order item
    @PutMapping("/{tableId}/orders/items/{dishId}")
    public ResponseEntity<TableOrderResponse> updateTableOrderItem(
            @PathVariable Integer tableId,
            @PathVariable Integer dishId,
            @RequestParam Integer quantity) {
        return ResponseEntity.ok(orderService.updateTableOrderItem(tableId, dishId, quantity));
    }
    //remove an order item
    @DeleteMapping("/{tableId}/orders/items/{dishId}")
    public ResponseEntity<TableOrderResponse> removeTableOrderItem(
            @PathVariable Integer tableId,
            @PathVariable Integer dishId) {
        return ResponseEntity.ok(orderService.removeTableOrderItem(tableId, dishId));
    }
    // cancel all orders
    @DeleteMapping("/{tableId}/orders")
    public ResponseEntity<Void> cancelTableOrder(@PathVariable Integer tableId) {
        orderService.cancelTableOrder(tableId);
        return ResponseEntity.ok().build();
    }
}