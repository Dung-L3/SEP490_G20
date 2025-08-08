package com.system.restaurant.management.controller;

import com.system.restaurant.management.dto.TableOrderRequest;
import com.system.restaurant.management.dto.TableOrderResponse;
import com.system.restaurant.management.entity.Order;
import com.system.restaurant.management.service.WaiterService;
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
    private final WaiterService waiterService;
    // get all orders
    @GetMapping("/{tableId}/active-orders") 
    public ResponseEntity<List<Order>> getActiveOrdersByTable(@PathVariable Integer tableId) {
        return ResponseEntity.ok(waiterService.getActiveOrdersByTable(tableId));
    }

    @PostMapping("/{tableId}/orders")
    public ResponseEntity<TableOrderResponse> addTableOrderItem(
            @PathVariable Integer tableId,
            @Valid @RequestBody TableOrderRequest request) {
        request.setTableId(tableId);
        return ResponseEntity.ok(waiterService.addTableOrderItem(request));
    }

    @PutMapping("/{tableId}/orders/items/{dishId}")
    public ResponseEntity<TableOrderResponse> updateTableOrderItem(
            @PathVariable Integer tableId,
            @PathVariable Integer dishId,
            @RequestParam Integer quantity) {
        return ResponseEntity.ok(waiterService.updateTableOrderItem(tableId, dishId, quantity));
    }

    @DeleteMapping("/{tableId}/orders/items/{dishId}")
    public ResponseEntity<TableOrderResponse> removeTableOrderItem(
            @PathVariable Integer tableId,
            @PathVariable Integer dishId) {
        return ResponseEntity.ok(waiterService.removeTableOrderItem(tableId, dishId));
    }

    @DeleteMapping("/{tableId}/orders")
    public ResponseEntity<Void> cancelTableOrder(@PathVariable Integer tableId) {
        waiterService.cancelTableOrder(tableId);
        return ResponseEntity.ok().build();
    }
}