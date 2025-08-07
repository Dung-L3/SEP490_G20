package com.system.restaurant.management.controller;

import com.system.restaurant.management.dto.OrderDto;
import com.system.restaurant.management.dto.OrderRequestDto;
import com.system.restaurant.management.entity.Order;
import com.system.restaurant.management.entity.OrderDetail;
import com.system.restaurant.management.entity.Dish;
import com.system.restaurant.management.service.OrderService;
import com.system.restaurant.management.service.DishService;
import com.system.restaurant.management.repository.OrderDetailRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class QRMenuOrderController {
    
    private final OrderService orderService;
    private final DishService dishService;
    private final OrderDetailRepository orderDetailRepository;

    /**
     * Tạo đơn hàng từ QR Menu
     * POST /api/v1/orders/create
     */
    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createOrder(@RequestBody Map<String, Object> requestBody) {
        try {
            Integer tableId = (Integer) requestBody.get("tableId");
            String orderType = (String) requestBody.getOrDefault("orderType", "DINE_IN");
            List<Map<String, Object>> items = (List<Map<String, Object>>) requestBody.get("items");

            if (tableId == null) {
                throw new IllegalArgumentException("Table ID is required");
            }
            
            if (items == null || items.isEmpty()) {
                throw new IllegalArgumentException("Order items are required");
            }

            // Tạo OrderRequestDto
            OrderRequestDto orderDto = new OrderRequestDto();
            orderDto.setOrderType(orderType);
            orderDto.setTableId(tableId);
            orderDto.setCreatedAt(LocalDateTime.now());
            
            // Tính toán totals từ items
            BigDecimal subTotal = BigDecimal.ZERO;
            for (Map<String, Object> item : items) {
                Integer quantity = (Integer) item.get("quantity");
                BigDecimal unitPrice = new BigDecimal(item.get("unitPrice").toString());
                subTotal = subTotal.add(unitPrice.multiply(BigDecimal.valueOf(quantity)));
            }
            
            orderDto.setSubTotal(subTotal);
            orderDto.setDiscountAmount(BigDecimal.ZERO);
            orderDto.setFinalTotal(subTotal);

            // Tạo order
            OrderRequestDto savedOrder = orderService.createOrder(orderDto);

            // Tạo order details
            if (savedOrder.getOrderId() != null) {
                for (Map<String, Object> item : items) {
                    OrderDetail detail = new OrderDetail();
                    detail.setOrderId(savedOrder.getOrderId());
                    detail.setDishId((Integer) item.get("dishId"));
                    detail.setQuantity((Integer) item.get("quantity"));
                    detail.setUnitPrice(new BigDecimal(item.get("unitPrice").toString()));
                    detail.setStatusId(1); // Pending
                    detail.setIsRefunded(0);
                    detail.setNotes((String) item.getOrDefault("notes", ""));
                    
                    orderDetailRepository.save(detail);
                }
            }

            Map<String, Object> response = new HashMap<>();
            response.put("orderId", savedOrder.getOrderId());
            response.put("message", "Đặt món thành công! Đơn hàng của bạn đang được xử lý.");
            response.put("order", savedOrder);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (IllegalArgumentException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Dữ liệu không hợp lệ");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Không thể tạo đơn hàng");
            errorResponse.put("message", "Lỗi hệ thống: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Lấy tất cả đơn hàng
     * GET /api/v1/orders/getAll
     */
    @GetMapping("/getAll")
    public ResponseEntity<List<OrderDto>> getAllOrders() {
        List<OrderDto> orders = orderService.findAll();
        return ResponseEntity.ok(orders);
    }

    /**
     * Lấy đơn hàng theo ID
     * GET /api/v1/orders/getById/{id}
     */
    @GetMapping("/getById/{id}")
    public ResponseEntity<OrderDto> getOrderById(@PathVariable Integer id) {
        OrderDto order = orderService.findById(id);
        return ResponseEntity.ok(order);
    }

    /**
     * Lấy đơn hàng theo bàn
     * GET /api/v1/orders/table/{tableId}/items
     */
    @GetMapping("/table/{tableId}/items")
    public ResponseEntity<List<Object>> getOrderItemsByTable(@PathVariable Integer tableId) {
        try {
            List<Object> orderItems = orderService.getActiveOrderItemsByTable(tableId);
            return ResponseEntity.ok(orderItems);
        } catch (Exception e) {
            return ResponseEntity.ok(List.of()); // Trả về danh sách rỗng nếu không có order
        }
    }
}