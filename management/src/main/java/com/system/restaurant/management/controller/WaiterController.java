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

    // Order Management with Reservation Tracking
    @PostMapping("/orders/create")
    public ResponseEntity<Order> createOrder(@RequestBody CreateOrderRequest request) {
        Order order = waiterService.createOrderWithReservationTracking(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    @PostMapping("/orders/create-dine-in")
    public ResponseEntity<Order> createDineInOrder(@RequestBody CreateDineInOrderRequest request) {
        Order order = waiterService.createDineInOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    @PostMapping("/orders/create-takeaway")
    public ResponseEntity<Order> createTakeawayOrder(@RequestBody CreateTakeawayOrderRequest request) {
        Order order = waiterService.createTakeawayOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
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

    @GetMapping("/orders/{orderId}")
    public ResponseEntity<Order> getOrderById(@PathVariable Integer orderId) {
        Order order = waiterService.getOrderById(orderId);
        return ResponseEntity.ok(order);
    }

    @PutMapping("/orders/{orderId}/status")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Integer orderId,
                                                   @RequestBody OrderStatusRequest request) {
        Order order = waiterService.updateOrderStatus(orderId, request.getStatusId());
        return ResponseEntity.ok(order);
    }

    // Table Management - FREE, OCCUPIED, RESERVED
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

    @PutMapping("/tables/{tableId}/occupy")
    public ResponseEntity<RestaurantTable> occupyTable(@PathVariable Integer tableId) {
        RestaurantTable table = waiterService.updateTableStatus(tableId, "OCCUPIED");
        return ResponseEntity.ok(table);
    }

    @PutMapping("/tables/{tableId}/free")
    public ResponseEntity<RestaurantTable> freeTable(@PathVariable Integer tableId) {
        RestaurantTable table = waiterService.updateTableStatus(tableId, "FREE");
        return ResponseEntity.ok(table);
    }

    // Customer Purchase History with PaymentRecord, Order, Invoice
    @GetMapping("/customers/phone/{phone}/purchase-history")
    public ResponseEntity<CustomerPurchaseHistoryResponse> getCustomerPurchaseHistoryByPhone(@PathVariable String phone) {
        CustomerPurchaseHistoryResponse history = waiterService.getCustomerPurchaseHistoryByPhone(phone);
        return ResponseEntity.ok(history);
    }

    // Reservation Check-in with Phone Tracking
    @PutMapping("/reservations/{reservationId}/checkin")
    public ResponseEntity<CheckInResponse> checkInReservation(@PathVariable Integer reservationId,
                                                              @RequestBody CheckInRequest request) {
        CheckInResponse response = waiterService.checkInReservation(reservationId, request.getTableId());
        return ResponseEntity.ok(response);
    }

    // Complete Payment Flow: Order -> Invoice -> PaymentRecord
    @PostMapping("/orders/{orderId}/complete-payment")
    public ResponseEntity<CompletePaymentResponse> processCompletePayment(@PathVariable Integer orderId,
                                                                          @RequestBody PaymentRequest request) {
        CompletePaymentResponse response = waiterService.processCompletePayment(orderId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Order Types: DINEIN, TAKEAWAY
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

    // Invoice Management
    @GetMapping("/invoices/order/{orderId}")
    public ResponseEntity<Invoice> getInvoiceByOrder(@PathVariable Integer orderId) {
        Invoice invoice = waiterService.getInvoiceByOrder(orderId);
        return ResponseEntity.ok(invoice);
    }

    @GetMapping("/invoices/{invoiceId}")
    public ResponseEntity<Invoice> getInvoiceById(@PathVariable Integer invoiceId) {
        Invoice invoice = waiterService.getInvoiceById(invoiceId);
        return ResponseEntity.ok(invoice);
    }

    // Payment Records
    @GetMapping("/payments/invoice/{invoiceId}")
    public ResponseEntity<List<PaymentRecord>> getPaymentRecordsByInvoice(@PathVariable Integer invoiceId) {
        List<PaymentRecord> records = waiterService.getPaymentRecordsByInvoice(invoiceId);
        return ResponseEntity.ok(records);
    }

    @GetMapping("/payments/order/{orderId}")
    public ResponseEntity<List<PaymentRecord>> getPaymentRecordsByOrder(@PathVariable Integer orderId) {
        List<PaymentRecord> records = waiterService.getPaymentRecordsByOrder(orderId);
        return ResponseEntity.ok(records);
    }
}