package com.system.restaurant.management.controller;

import com.system.restaurant.management.dto.*;
import com.system.restaurant.management.entity.*;
import com.system.restaurant.management.service.WaiterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/waiter")
@RequiredArgsConstructor
public class WaiterController {

    private final WaiterService waiterService;

    // Order Management
    @PostMapping("/orders/create")
    public ResponseEntity<Order> createOrder(@RequestBody CreateOrderRequest request) {
        try {
            Order order = waiterService.createOrderWithReservationTracking(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(order);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/orders/create-dine-in")
    public ResponseEntity<Order> createDineInOrder(@RequestBody CreateDineInOrderRequest request) {
        try {
            Order order = waiterService.createDineInOrder(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(order);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/orders/create-takeaway")
    public ResponseEntity<Order> createTakeawayOrder(@RequestBody CreateTakeawayOrderRequest request) {
        try {
            Order order = waiterService.createTakeawayOrder(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(order);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Table Management
    @GetMapping("/tables/free")
    public ResponseEntity<List<RestaurantTable>> getFreeTables() {
        List<RestaurantTable> tables = waiterService.getTablesByStatus("FREE");
        return ResponseEntity.ok(tables);
    }

    @GetMapping("/tables/occupied")
    public ResponseEntity<List<RestaurantTable>> getOccupiedTables() {
        List<RestaurantTable> tables = waiterService.getTablesByStatus("OCCUPIED");
        return ResponseEntity.ok(tables);
    }

    @GetMapping("/tables/reserved")
    public ResponseEntity<List<RestaurantTable>> getReservedTables() {
        List<RestaurantTable> tables = waiterService.getTablesByStatus("RESERVED");
        return ResponseEntity.ok(tables);
    }

    // Table Management
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

    @GetMapping("/tables/window")
    public ResponseEntity<List<RestaurantTable>> getWindowTables() {
        List<RestaurantTable> tables = waiterService.getWindowTables();
        return ResponseEntity.ok(tables);
    }

    @GetMapping("/tables/window/free")
    public ResponseEntity<List<RestaurantTable>> getFreeWindowTables() {
        List<RestaurantTable> tables = waiterService.getFreeWindowTables();
        return ResponseEntity.ok(tables);
    }

    @GetMapping("/tables/type/{tableType}")
    public ResponseEntity<List<RestaurantTable>> getTablesByType(@PathVariable String tableType) {
        List<RestaurantTable> tables = waiterService.getTablesByType(tableType);
        return ResponseEntity.ok(tables);
    }

    @GetMapping("/tables/name/{tableName}")
    public ResponseEntity<RestaurantTable> getTableByName(@PathVariable String tableName) {
        try {
            RestaurantTable table = waiterService.getTableByName(tableName);
            return ResponseEntity.ok(table);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/tables/{tableId}/occupy")
    public ResponseEntity<RestaurantTable> occupyTable(@PathVariable Integer tableId) {
        try {
            RestaurantTable table = waiterService.updateTableStatus(tableId, "OCCUPIED");
            return ResponseEntity.ok(table);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/tables/{tableId}/free")
    public ResponseEntity<RestaurantTable> freeTable(@PathVariable Integer tableId) {
        try {
            RestaurantTable table = waiterService.updateTableStatus(tableId, "FREE");
            return ResponseEntity.ok(table);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/tables/{tableId}/reserve")
    public ResponseEntity<RestaurantTable> reserveTable(@PathVariable Integer tableId) {
        try {
            RestaurantTable table = waiterService.updateTableStatus(tableId, "RESERVED");
            return ResponseEntity.ok(table);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/orders/table/{tableId}")
    public ResponseEntity<List<Order>> getOrdersByTable(@PathVariable Integer tableId) {
        List<Order> orders = waiterService.getOrdersByTable(tableId);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/orders/active")
    public ResponseEntity<List<Order>> getActiveOrders() {
        List<Order> orders = waiterService.getActiveOrders();
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/customers/phone/{phone}/purchase-history")
    public ResponseEntity<CustomerPurchaseHistoryResponse> getCustomerPurchaseHistoryByPhone(@PathVariable String phone) {
        CustomerPurchaseHistoryResponse history = waiterService.getCustomerPurchaseHistoryByPhone(phone);
        return ResponseEntity.ok(history);
    }

    @PutMapping("/reservations/{reservationId}/checkin")
    public ResponseEntity<CheckInResponse> checkInReservation(@PathVariable Integer reservationId,
                                                              @RequestBody CheckInRequest request) {
        try {
            CheckInResponse response = waiterService.checkInReservation(reservationId, request.getTableId());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/orders/{orderId}/complete-payment")
    public ResponseEntity<CompletePaymentResponse> processCompletePayment(@PathVariable Integer orderId,
                                                                          @RequestBody PaymentRequest request) {
        try {
            CompletePaymentResponse response = waiterService.processCompletePayment(orderId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/orders/dine-in")
    public ResponseEntity<List<Order>> getDineInOrders() {
        List<Order> orders = waiterService.getOrdersByType("DINEIN");
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/orders/takeaway")
    public ResponseEntity<List<Order>> getTakeawayOrders() {
        List<Order> orders = waiterService.getOrdersByType("TAKEAWAY");
        return ResponseEntity.ok(orders);
    }
}