package com.system.restaurant.management.controller;

import com.system.restaurant.management.dto.*;
import com.system.restaurant.management.entity.*;
import com.system.restaurant.management.service.WaiterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/waiter")
@RequiredArgsConstructor
public class WaiterController {
    private final WaiterService waiterService;

    // Order Management
    @PostMapping("/orders/create")
    public ResponseEntity<Order> createOrder(@RequestBody CreateOrderRequest request) {
        Order order = waiterService.createOrder(request);
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
        Order order = waiterService.updateOrderStatus(orderId, request.getStatus());
        return ResponseEntity.ok(order);
    }

    // Order Item Management
    @PostMapping("/orders/{orderId}/items")
    public ResponseEntity<OrderItem> addOrderItem(@PathVariable Integer orderId,
                                                  @RequestBody AddOrderItemRequest request) {
        OrderItem orderItem = waiterService.addOrderItem(orderId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(orderItem);
    }

    @PutMapping("/orders/items/{itemId}")
    public ResponseEntity<OrderItem> updateOrderItem(@PathVariable Integer itemId,
                                                     @RequestBody UpdateOrderItemRequest request) {
        OrderItem orderItem = waiterService.updateOrderItem(itemId, request);
        return ResponseEntity.ok(orderItem);
    }

    @DeleteMapping("/orders/items/{itemId}")
    public ResponseEntity<Void> removeOrderItem(@PathVariable Integer itemId) {
        waiterService.removeOrderItem(itemId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/orders/{orderId}/items")
    public ResponseEntity<List<OrderItem>> getOrderItems(@PathVariable Integer orderId) {
        List<OrderItem> items = waiterService.getOrderItems(orderId);
        return ResponseEntity.ok(items);
    }

    // Table Management - Only READ operations (no conflict with ManageTableController)
    @GetMapping("/tables/my-assigned")
    public ResponseEntity<List<RestaurantTable>> getMyAssignedTables() {
        List<RestaurantTable> tables = waiterService.getMyAssignedTables();
        return ResponseEntity.ok(tables);
    }

    @GetMapping("/tables/available-for-service")
    public ResponseEntity<List<RestaurantTable>> getAvailableTablesForService() {
        List<RestaurantTable> tables = waiterService.getAvailableTablesForService();
        return ResponseEntity.ok(tables);
    }

    @GetMapping("/tables/{tableId}/current-order")
    public ResponseEntity<Order> getCurrentTableOrder(@PathVariable Integer tableId) {
        Order order = waiterService.getCurrentTableOrder(tableId);
        return ResponseEntity.ok(order);
    }

    // Menu Management
    @GetMapping("/menu/available")
    public ResponseEntity<List<MenuItem>> getAvailableMenuItems() {
        List<MenuItem> items = waiterService.getAvailableMenuItems();
        return ResponseEntity.ok(items);
    }

    @GetMapping("/menu/category/{category}")
    public ResponseEntity<List<MenuItem>> getMenuByCategory(@PathVariable String category) {
        List<MenuItem> items = waiterService.getMenuByCategory(category);
        return ResponseEntity.ok(items);
    }

    @GetMapping("/menu/search")
    public ResponseEntity<List<MenuItem>> searchMenuItems(@RequestParam String keyword) {
        List<MenuItem> items = waiterService.searchMenuItems(keyword);
        return ResponseEntity.ok(items);
    }

    // Customer Management
    @PostMapping("/customers/register")
    public ResponseEntity<Customer> registerCustomer(@RequestBody CustomerRegistrationRequest request) {
        Customer customer = waiterService.registerCustomer(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(customer);
    }

    @GetMapping("/customers/search")
    public ResponseEntity<List<Customer>> searchCustomers(@RequestParam String keyword) {
        List<Customer> customers = waiterService.searchCustomers(keyword);
        return ResponseEntity.ok(customers);
    }

    @GetMapping("/customers/{customerId}")
    public ResponseEntity<Customer> getCustomerById(@PathVariable Integer customerId) {
        Customer customer = waiterService.getCustomerById(customerId);
        return ResponseEntity.ok(customer);
    }

    // Reservation Management
    @PostMapping("/reservations/create")
    public ResponseEntity<Reservation> createReservation(@RequestBody CreateReservationRequest request) {
        Reservation reservation = waiterService.createReservation(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(reservation);
    }

    @GetMapping("/reservations/today")
    public ResponseEntity<List<Reservation>> getTodayReservations() {
        List<Reservation> reservations = waiterService.getTodayReservations();
        return ResponseEntity.ok(reservations);
    }

    @GetMapping("/reservations/my-assigned")
    public ResponseEntity<List<Reservation>> getMyAssignedReservations() {
        List<Reservation> reservations = waiterService.getMyAssignedReservations();
        return ResponseEntity.ok(reservations);
    }

    @PutMapping("/reservations/{reservationId}/checkin")
    public ResponseEntity<Reservation> checkInReservation(@PathVariable Integer reservationId,
                                                          @RequestBody CheckInRequest request) {
        Reservation reservation = waiterService.checkInReservation(reservationId, request.getTableId());
        return ResponseEntity.ok(reservation);
    }

    // Bill Management
    @PostMapping("/bills/generate/{orderId}")
    public ResponseEntity<Bill> generateBill(@PathVariable Integer orderId) {
        Bill bill = waiterService.generateBill(orderId);
        return ResponseEntity.status(HttpStatus.CREATED).body(bill);
    }

    @GetMapping("/bills/{billId}")
    public ResponseEntity<Bill> getBillById(@PathVariable Integer billId) {
        Bill bill = waiterService.getBillById(billId);
        return ResponseEntity.ok(bill);
    }

    @GetMapping("/bills/table/{tableId}")
    public ResponseEntity<List<Bill>> getBillsByTable(@PathVariable Integer tableId) {
        List<Bill> bills = waiterService.getBillsByTable(tableId);
        return ResponseEntity.ok(bills);
    }

    @PutMapping("/bills/{billId}/payment")
    public ResponseEntity<Bill> processPayment(@PathVariable Integer billId,
                                               @RequestBody PaymentRequest request) {
        Bill bill = waiterService.processPayment(billId, request);
        return ResponseEntity.ok(bill);
    }

    @PutMapping("/bills/{billId}/discount")
    public ResponseEntity<Bill> applyDiscount(@PathVariable Integer billId,
                                              @RequestBody DiscountRequest request) {
        Bill bill = waiterService.applyDiscount(billId, request);
        return ResponseEntity.ok(bill);
    }

    // Kitchen Communication
    @PostMapping("/kitchen/orders/{orderId}/send")
    public ResponseEntity<Void> sendOrderToKitchen(@PathVariable Integer orderId) {
        waiterService.sendOrderToKitchen(orderId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/kitchen/orders/ready")
    public ResponseEntity<List<Order>> getReadyOrders() {
        List<Order> orders = waiterService.getReadyOrders();
        return ResponseEntity.ok(orders);
    }

    @PostMapping("/kitchen/orders/{orderId}/serve")
    public ResponseEntity<Order> markOrderAsServed(@PathVariable Integer orderId) {
        Order order = waiterService.markOrderAsServed(orderId);
        return ResponseEntity.ok(order);
    }

    // Shift Management
    @PostMapping("/shift/start")
    public ResponseEntity<WaiterShift> startShift() {
        WaiterShift shift = waiterService.startShift();
        return ResponseEntity.status(HttpStatus.CREATED).body(shift);
    }

    @PostMapping("/shift/end")
    public ResponseEntity<WaiterShift> endShift() {
        WaiterShift shift = waiterService.endShift();
        return ResponseEntity.ok(shift);
    }

    @GetMapping("/shift/current")
    public ResponseEntity<WaiterShift> getCurrentShift() {
        WaiterShift shift = waiterService.getCurrentShift();
        return ResponseEntity.ok(shift);
    }

    // Reports and Analytics
    @GetMapping("/reports/orders/today")
    public ResponseEntity<List<Order>> getTodayOrders() {
        List<Order> orders = waiterService.getTodayOrders();
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/reports/sales/today")
    public ResponseEntity<Map<String, Object>> getTodaySales() {
        Map<String, Object> sales = waiterService.getTodaySalesReport();
        return ResponseEntity.ok(sales);
    }

    @GetMapping("/reports/performance")
    public ResponseEntity<Map<String, Object>> getPerformanceReport() {
        Map<String, Object> performance = waiterService.getWaiterPerformanceReport();
        return ResponseEntity.ok(performance);
    }

    // Notifications
    @GetMapping("/notifications")
    public ResponseEntity<List<Notification>> getNotifications() {
        List<Notification> notifications = waiterService.getWaiterNotifications();
        return ResponseEntity.ok(notifications);
    }

    @PutMapping("/notifications/{notificationId}/read")
    public ResponseEntity<Void> markNotificationAsRead(@PathVariable Integer notificationId) {
        waiterService.markNotificationAsRead(notificationId);
        return ResponseEntity.ok().build();
    }

    // Special Requests
    @PostMapping("/orders/{orderId}/special-request")
    public ResponseEntity<Order> addSpecialRequest(@PathVariable Integer orderId,
                                                   @RequestBody SpecialRequestRequest request) {
        Order order = waiterService.addSpecialRequest(orderId, request);
        return ResponseEntity.ok(order);
    }

    @GetMapping("/orders/{orderId}/special-requests")
    public ResponseEntity<List<SpecialRequest>> getSpecialRequests(@PathVariable Integer orderId) {
        List<SpecialRequest> requests = waiterService.getSpecialRequests(orderId);
        return ResponseEntity.ok(requests);
    }
}