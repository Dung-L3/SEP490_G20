package com.system.restaurant.management.controller;

import com.system.restaurant.management.dto.*;
import com.system.restaurant.management.entity.*;
import com.system.restaurant.management.service.WaiterService;
import com.system.restaurant.management.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/waiter")
@RequiredArgsConstructor
public class WaiterController {

    private final WaiterService waiterService;

    @GetMapping("/tables/by-name/{tableName}")
    public ResponseEntity<RestaurantTable> getTableByName(@PathVariable String tableName) {
        return ResponseEntity.ok(waiterService.getTableByName(tableName));
    }

    @GetMapping("/tables/window")
    public ResponseEntity<List<RestaurantTable>> getWindowTables() {
        return ResponseEntity.ok(waiterService.getWindowTables());
    }

    @GetMapping("/tables/window/free")
    public ResponseEntity<List<RestaurantTable>> getFreeWindowTables() {
        return ResponseEntity.ok(waiterService.getFreeWindowTables());
    }

    @GetMapping("/tables/type/{tableType}")
    public ResponseEntity<List<RestaurantTable>> getTablesByType(@PathVariable String tableType) {
        return ResponseEntity.ok(waiterService.getTablesByType(tableType));
    }

    @PostMapping("/orders/dine-in")
    public ResponseEntity<Order> createDineInOrder(@Valid @RequestBody CreateDineInOrderRequest request) {
        return ResponseEntity.ok(waiterService.createDineInOrder(request));
    }

//    @PostMapping("/orders/takeaway")
//    public ResponseEntity<Order> createTakeawayOrder(@Valid @RequestBody CreateTakeawayOrderRequest request) {
//        return ResponseEntity.ok(waiterService.createTakeawayOrder(request));
//    }

    @PostMapping("/reservations/{reservationId}/check-in")
    public ResponseEntity<CheckInResponse> checkInReservation(
            @PathVariable Integer reservationId,
            @RequestParam Integer tableId) {
        return ResponseEntity.ok(waiterService.checkInReservation(reservationId, tableId));
    }

    @GetMapping("/orders/active")
    public ResponseEntity<List<Order>> getActiveOrders() {
        return ResponseEntity.ok(waiterService.getActiveOrders());
    }

    @GetMapping("/orders/table/{tableId}")
    public ResponseEntity<List<Order>> getOrdersByTable(@PathVariable Integer tableId) {
        return ResponseEntity.ok(waiterService.getOrdersByTable(tableId));
    }

    @GetMapping("/orders/{orderId}")
    public ResponseEntity<Order> getOrderById(@PathVariable Integer orderId) {
        return ResponseEntity.ok(waiterService.getOrderById(orderId));
    }

    @GetMapping("/orders/{orderId}/invoice")
    public ResponseEntity<InvoiceResponseDTO> getInvoiceByOrder(@PathVariable Integer orderId) {
        return ResponseEntity.ok(waiterService.getInvoiceResponseByOrder(orderId));
    }

    @PutMapping("/orders/{orderId}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Integer orderId,
            @RequestParam Integer statusId) {
        return ResponseEntity.ok(waiterService.updateOrderStatus(orderId, statusId));
    }

    @GetMapping("/tables")
    public ResponseEntity<List<RestaurantTable>> getTablesByStatus(@RequestParam String status) {
        List<String> statuses = List.of(status.split(","));
        return ResponseEntity.ok(waiterService.getTablesByStatuses(statuses));
    }

    @PutMapping("/tables/{tableId}/status")
    public ResponseEntity<RestaurantTable> updateTableStatus(
            @PathVariable Integer tableId,
            @RequestParam String status) {
        return ResponseEntity.ok(waiterService.updateTableStatus(tableId, status));
    }

    @GetMapping("/tables/area/{areaId}")
    public ResponseEntity<List<RestaurantTable>> getTablesByArea(@PathVariable Integer areaId) {
        return ResponseEntity.ok(waiterService.getTablesByArea(areaId));
    }

    @GetMapping("/tables/area/{areaId}/free")
    public ResponseEntity<List<RestaurantTable>> getFreeTablesByArea(@PathVariable Integer areaId) {
        return ResponseEntity.ok(waiterService.getFreeTablesByArea(areaId));
    }

    @PostMapping("/orders/{orderId}/payment")
    public ResponseEntity<CompletePaymentResponse> processPayment(
            @PathVariable Integer orderId,
            @Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.ok(waiterService.processCompletePayment(orderId, request));
    }

    @GetMapping("/customers/{phone}/history")
    public ResponseEntity<CustomerPurchaseHistoryResponse> getCustomerHistory(@PathVariable String phone) {
        return ResponseEntity.ok(waiterService.getCustomerPurchaseHistoryByPhone(phone));
    }

    @GetMapping("/orders/detail/{orderDetailId}/status")
    public ResponseEntity<Map<String, Object>> getOrderDetailStatus(@PathVariable Integer orderDetailId) {
        OrderDetail orderDetail = waiterService.getOrderDetailById(orderDetailId);
        String status = switch (orderDetail.getStatusId()) {
            case 1 -> "pending";
            case 2 -> "cooking";
            case 3 -> "completed";
            default -> "unknown";
        };
        
        Map<String, Object> response = new HashMap<>();
        response.put("status", status);
        response.put("statusId", orderDetail.getStatusId());
        response.put("orderDetailId", orderDetail.getOrderDetailId());
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/orders/{orderId}/items")
    public ResponseEntity<List<OrderDetail>> getOrderItems(@PathVariable Integer orderId) {
        // Chỉ trả về các món ở trạng thái pending (StatusId = 1)
        List<OrderDetail> items = waiterService.getOrderItems(orderId);
        List<OrderDetail> pendingItems = items.stream()
            .filter(item -> item.getStatusId() == 1)
            .collect(Collectors.toList());
        return ResponseEntity.ok(pendingItems);
    }
}