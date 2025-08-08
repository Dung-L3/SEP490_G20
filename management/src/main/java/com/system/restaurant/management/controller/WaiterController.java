package com.system.restaurant.management.controller;

import com.system.restaurant.management.dto.*;
import com.system.restaurant.management.entity.*;
import com.system.restaurant.management.service.WaiterService;
import com.system.restaurant.management.service.OrderService;
import com.system.restaurant.management.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/waiter")
@RequiredArgsConstructor
public class WaiterController {

    private final WaiterService waiterService;
    private final OrderService orderService;

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



    @PostMapping("/orders/dine-in")
    public ResponseEntity<Order> createDineInOrder(@Valid @RequestBody CreateDineInOrderRequest request) {
        return ResponseEntity.ok(waiterService.createDineInOrder(request));
    }

    @PostMapping("/orders/takeaway")
    public ResponseEntity<Order> createTakeawayOrder(@Valid @RequestBody CreateTakeawayOrderRequest request) {
        return ResponseEntity.ok(waiterService.createTakeawayOrder(request));
    }

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
    public ResponseEntity<List<RestaurantTable>> getTablesByStatus(@RequestParam(required = false) String status) {
        try {
            System.out.println("Getting tables with status: " + status);
            
            List<RestaurantTable> tables;
            if (status != null && !status.isEmpty()) {
                tables = waiterService.getTablesByStatus(status);
            } else {
                // If no status specified, get all tables
                tables = waiterService.getTablesByStatus("OCCUPIED"); // Default to occupied for waiter
            }
            
            System.out.println("Found " + tables.size() + " tables");
            return ResponseEntity.ok(tables);
            
        } catch (Exception e) {
            System.err.println("Error getting tables: " + e.getMessage());
            e.printStackTrace();
            
            // Return empty list instead of error
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    @PutMapping("/tables/{tableId}/status")
    public ResponseEntity<RestaurantTable> updateTableStatus(
            @PathVariable Integer tableId,
            @RequestParam String status) {
        try {
            RestaurantTable table = waiterService.updateTableStatus(tableId, status);
            return ResponseEntity.ok(table);
        } catch (Exception e) {
            System.err.println("Error updating table status: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
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

    // === ORDER MANAGEMENT ENDPOINTS ===
    
    // Get order items for individual table
    @GetMapping("/orders/{tableId}/items")
    public ResponseEntity<List<Object>> getOrderItemsByTable(@PathVariable Integer tableId) {
        try {
            List<Object> items = orderService.getActiveOrderItemsByTable(tableId);
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            System.err.println("Error getting order items for table: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ArrayList<>());
        }
    }



    // Create order for table or merged table
    @PostMapping("/orders/create")
    public ResponseEntity<?> createOrderForTable(@RequestBody TableOrderRequest request) {
        try {
            if (request.getTableId() == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "TableId must be provided"));
            }
            // Create order for individual table
            Order order = waiterService.createDineInOrder(new CreateDineInOrderRequest(request));
            return ResponseEntity.ok(Map.of(
                "orderId", order.getOrderId(),
                "message", "Order created successfully"
            ));
        } catch (Exception e) {
            System.err.println("Error creating order: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}