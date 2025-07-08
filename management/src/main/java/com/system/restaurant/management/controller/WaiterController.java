package com.system.restaurant.management.controller;

import com.system.restaurant.management.dto.*;
import com.system.restaurant.management.entity.*;
import com.system.restaurant.management.service.WaiterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/waiter")
@RequiredArgsConstructor
public class WaiterController {

    private final WaiterService waiterService;

    @PostMapping("/orders")
    public ResponseEntity<Order> createOrder(@RequestBody CreateOrderRequest request) {
        Order order = waiterService.createOrderWithReservationTracking(request);
        return ResponseEntity.ok(order);
    }

    @PostMapping("/orders/dine-in")
    public ResponseEntity<Order> createDineInOrder(@RequestBody CreateDineInOrderRequest request) {
        Order order = waiterService.createDineInOrder(request);
        return ResponseEntity.ok(order);
    }

    @PostMapping("/orders/takeaway")
    public ResponseEntity<Order> createTakeawayOrder(@RequestBody CreateTakeawayOrderRequest request) {
        Order order = waiterService.createTakeawayOrder(request);
        return ResponseEntity.ok(order);
    }

    @PostMapping("/reservations/{reservationId}/checkin")
    public ResponseEntity<CheckInResponse> checkInReservation(
            @PathVariable Integer reservationId,
            @RequestParam Integer tableId) {
        CheckInResponse response = waiterService.checkInReservation(reservationId, tableId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/orders/{orderId}/payment")
    public ResponseEntity<CompletePaymentResponse> processPayment(
            @PathVariable Integer orderId,
            @RequestBody PaymentRequest request) {
        CompletePaymentResponse response = waiterService.processCompletePayment(orderId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/orders/active")
    public ResponseEntity<List<Order>> getActiveOrders() {
        List<Order> orders = waiterService.getActiveOrders();
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/orders/table/{tableId}")
    public ResponseEntity<List<Order>> getOrdersByTable(@PathVariable Integer tableId) {
        List<Order> orders = waiterService.getOrdersByTable(tableId);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/orders/{orderId}")
    public ResponseEntity<Order> getOrderById(@PathVariable Integer orderId) {
        Order order = waiterService.getOrderById(orderId);
        return ResponseEntity.ok(order);
    }

    @PutMapping("/orders/{orderId}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Integer orderId,
            @RequestParam Integer statusId) {
        Order order = waiterService.updateOrderStatus(orderId, statusId);
        return ResponseEntity.ok(order);
    }

    @GetMapping("/tables")
    public ResponseEntity<List<RestaurantTable>> getTablesByStatus(@RequestParam String status) {
        List<RestaurantTable> tables = waiterService.getTablesByStatus(status);
        return ResponseEntity.ok(tables);
    }

    @GetMapping("/tables/area/{areaId}")
    public ResponseEntity<List<RestaurantTable>> getTablesByArea(@PathVariable Integer areaId) {
        List<RestaurantTable> tables = waiterService.getTablesByArea(areaId);
        return ResponseEntity.ok(tables);
    }

    @GetMapping("/tables/area/{areaId}/free")
    public ResponseEntity<List<RestaurantTable>> getFreeTablesByArea(@PathVariable Integer areaId) {
        List<RestaurantTable> tables = waiterService.getFreeTablesByArea(areaId);
        return ResponseEntity.ok(tables);
    }

    @GetMapping("/customers/{phone}/history")
    public ResponseEntity<CustomerPurchaseHistoryResponse> getCustomerHistory(@PathVariable String phone) {
        CustomerPurchaseHistoryResponse response = waiterService.getCustomerPurchaseHistoryByPhone(phone);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/invoices/order/{orderId}")
    public ResponseEntity<Invoice> getInvoiceByOrder(@PathVariable Integer orderId) {
        Invoice invoice = waiterService.getInvoiceByOrder(orderId);
        return ResponseEntity.ok(invoice);
    }
}