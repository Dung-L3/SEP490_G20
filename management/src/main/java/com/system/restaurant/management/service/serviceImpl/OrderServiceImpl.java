package com.system.restaurant.management.service.serviceImpl;

import com.system.restaurant.management.dto.OrderDto;
import com.system.restaurant.management.dto.OrderRequestDto;
import com.system.restaurant.management.dto.TableOrderRequest;
import com.system.restaurant.management.dto.TableOrderResponse;
import com.system.restaurant.management.dto.OrderItemRequest;
import com.system.restaurant.management.entity.Order;
import com.system.restaurant.management.entity.OrderDetail;
import com.system.restaurant.management.entity.OrderStatus;
import com.system.restaurant.management.entity.Dish;
import com.system.restaurant.management.exception.ResourceNotFoundException;
import com.system.restaurant.management.repository.OrderRepository;
import com.system.restaurant.management.repository.OrderDetailRepository;
import com.system.restaurant.management.repository.DishRepository;
import com.system.restaurant.management.repository.OrderStatusRepository;
import com.system.restaurant.management.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import java.util.HashMap;
import java.util.Map;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {
    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final DishRepository dishRepository;
    private final OrderStatusRepository statusRepo;

    // ====== QR MENU METHODS ======
    @Override
    public List<OrderDto> findAll() {
        List<Order> orders = orderRepository.findAll();
        return orders.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public OrderRequestDto createOrder(OrderRequestDto orderDto) {
        try {
            // Tạo Order entity từ DTO
            Order order = new Order();
            order.setOrderType(orderDto.getOrderType() != null ? orderDto.getOrderType() : "DINE_IN");
            order.setCustomerName(orderDto.getCustomerName());
            order.setPhone(orderDto.getPhone());
            order.setTableId(orderDto.getTableId());
            order.setSubTotal(orderDto.getSubTotal() != null ? orderDto.getSubTotal() : BigDecimal.ZERO);
            order.setDiscountAmount(orderDto.getDiscountAmount() != null ? orderDto.getDiscountAmount() : BigDecimal.ZERO);
            order.setFinalTotal(orderDto.getFinalTotal() != null ? orderDto.getFinalTotal() : BigDecimal.ZERO);
            order.setNotes(orderDto.getNotes());
            order.setCreatedAt(LocalDateTime.now());
            order.setStatusId(1); // Pending
            order.setIsRefunded(0);

            // Lưu order
            Order savedOrder = orderRepository.save(order);

            // Chuyển đổi ngược về DTO
            OrderRequestDto result = new OrderRequestDto();
            result.setOrderId(savedOrder.getOrderId());
            result.setOrderType(savedOrder.getOrderType());
            result.setCustomerName(savedOrder.getCustomerName());
            result.setPhone(savedOrder.getPhone());
            result.setTableId(savedOrder.getTableId());
            result.setSubTotal(savedOrder.getSubTotal());
            result.setDiscountAmount(savedOrder.getDiscountAmount());
            result.setFinalTotal(savedOrder.getFinalTotal());
            result.setNotes(savedOrder.getNotes());
            result.setCreatedAt(savedOrder.getCreatedAt());
            result.setStatus("Pending");

            return result;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Failed to create order: " + e.getMessage());
        }
    }

    @Override
    public List<Object> getActiveOrderItemsByTable(Integer tableId) {
        try {
            System.out.println("Getting active order items for table: " + tableId);
            
            List<Integer> activeStatuses = Arrays.asList(1, 2); // Pending and Confirmed
            List<Order> activeOrders = orderRepository.findByTableIdAndStatusIdIn(tableId, activeStatuses);
            List<Object> result = new ArrayList<>();
            
            for (Order order : activeOrders) {
                List<OrderDetail> orderDetails = orderDetailRepository.findByOrder_OrderId(order.getOrderId());
                
                for (OrderDetail detail : orderDetails) {
                    Map<String, Object> item = new HashMap<>();
                    item.put("orderDetailId", detail.getOrderDetailId());
                    item.put("dishId", detail.getDish().getDishId());
                    item.put("dishName", detail.getDish().getDishName());
                    item.put("quantity", detail.getQuantity());
                    item.put("unitPrice", detail.getUnitPrice());
                    item.put("status", getOrderDetailStatus(detail.getStatusId()));
                    item.put("imageUrl", detail.getDish().getImageUrl());
                    item.put("orderId", order.getOrderId());
                    item.put("tableId", tableId);
                    
                    result.add(item);
                }
            }
            
            System.out.println("Found " + result.size() + " active items for table");
            return result;
            
        } catch (Exception e) {
            System.err.println("Error getting active order items for table: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    // ====== EXISTING METHODS ======
    @Override
    public OrderDto findById(Integer id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
        return mapToDto(order);
    }

    @Override
    public Order createOrder(Order order) {
        return orderRepository.save(order);
    }

    @Override
    public Order updateOrder(Order order) {
        return orderRepository.save(order);
    }

    @Override
    public OrderDetail addOrderDetail(OrderDetail orderDetail) {
        return orderDetailRepository.save(orderDetail);
    }

    @Override
    public OrderDetail updateOrderDetail(OrderDetail orderDetail) {
        return orderDetailRepository.save(orderDetail);
    }



    @Override
    public List<OrderDto> getUnpaidOrders() {
        OrderStatus pending = statusRepo.findByStatusName("Processing")
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Processing status not found"));

        Integer pendingId = pending.getStatusId();
        List<Order> orders = orderRepository.findByStatusId(pendingId);
        return orders.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public void cancelOrderDetail(Integer orderDetailId) {
        OrderDetail detail = orderDetailRepository.findById(orderDetailId)
                .orElseThrow(() -> new ResourceNotFoundException("Order detail not found"));
        detail.setStatusId(4); // Cancelled
        orderDetailRepository.save(detail);
    }

    private OrderDto mapToDto(Order order) {
        OrderDto dto = new OrderDto();
        dto.setOrderId(order.getOrderId());
        dto.setOrderType(order.getOrderType());
        dto.setCustomerName(order.getCustomerName());
        dto.setTableName(order.getTable() != null
                ? order.getTable().getTableName()
                : null);
        dto.setSubTotal(order.getSubTotal());
        dto.setDiscountAmount(order.getDiscountAmount());
        dto.setFinalTotal(order.getFinalTotal());
        dto.setCreatedAt(order.getCreatedAt());
        return dto;
    }

    @Override
    public OrderDetail replaceOrderDetail(Integer orderDetailId, OrderDetail newOrderDetail) {
        OrderDetail detail = orderDetailRepository.findById(orderDetailId)
                .orElseThrow(() -> new ResourceNotFoundException("Order detail not found"));
        detail.setQuantity(newOrderDetail.getQuantity());
        detail.setUnitPrice(newOrderDetail.getUnitPrice());
        detail.setNotes(newOrderDetail.getNotes());
        return orderDetailRepository.save(detail);
    }

    @Override
    public List<Order> getOrdersByTable(Integer tableId) {
        return orderRepository.findByTable_TableId(tableId);
    }

    @Override
    public Order getOrderById(Integer orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
    }

    @Override
    public List<OrderDetail> getOrderDetails(Integer orderId) {
        return orderDetailRepository.findByOrderId(orderId);
    }







    private String getStatusName(Integer statusId) {
        switch (statusId) {
            case 1: return "Pending";
            case 2: return "Processing";
            case 3: return "Done";
            case 4: return "Cancelled";
            default: return "Unknown";
        }
    }

    private String getOrderDetailStatus(Integer statusId) {
        return switch (statusId) {
            case 1 -> "pending";
            case 2 -> "cooking";
            case 3 -> "completed";
            default -> "unknown";
        };
    }
}