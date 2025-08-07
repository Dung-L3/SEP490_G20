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
    public List<Order> getOrdersByTableAndStatuses(Integer tableId, List<Integer> statusIds) {
        return orderRepository.findByTableIdAndStatusIdIn(tableId, statusIds);
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

    @Override
    public TableOrderResponse addTableOrderItem(TableOrderRequest request) {
        try {
            System.out.println("Adding order items to table: " + request.getTableId());
            
            // Find or create pending order for the table
            Optional<Order> existingOrderOpt = orderRepository.findActiveOrderByTableId(request.getTableId());
            Order order;
            
            if (existingOrderOpt.isPresent()) {
                order = existingOrderOpt.get();
                System.out.println("Found existing order: " + order.getOrderId());
            } else {
                // Create new order
                order = Order.builder()
                    .orderType(request.getOrderType() != null ? request.getOrderType() : "DINE_IN")
                    .tableId(request.getTableId())
                    .statusId(1) // Pending
                    .subTotal(BigDecimal.ZERO)
                    .discountAmount(BigDecimal.ZERO)
                    .finalTotal(BigDecimal.ZERO)
                    .isRefunded(0)
                    .createdAt(LocalDateTime.now())
                    .build();
                order = orderRepository.save(order);
                System.out.println("Created new order: " + order.getOrderId());
            }
            
            // Add order details
            Integer lastOrderDetailId = null;
            for (var item : request.getItems()) {
                Dish dish = dishRepository.findById(item.getDishId())
                    .orElseThrow(() -> new IllegalArgumentException("Dish not found: " + item.getDishId()));
                
                OrderDetail orderDetail = OrderDetail.builder()
                    .order(order)
                    .dish(dish)
                    .quantity(item.getQuantity())
                    .unitPrice(dish.getPrice())
                    .notes(item.getNotes() != null ? item.getNotes() : "")
                    .statusId(1) // Pending
                    .build();
                
                orderDetail = orderDetailRepository.save(orderDetail);
                lastOrderDetailId = orderDetail.getOrderDetailId();
            }
            
            // Update order totals
            updateOrderTotals(order);
            
            return new TableOrderResponse(
                order.getOrderId(),
                lastOrderDetailId,
                "Items added to table successfully"
            );
            
        } catch (Exception e) {
            System.err.println("Error adding items to table: " + e.getMessage());
            throw new RuntimeException("Failed to add items to table: " + e.getMessage());
        }
    }

    @Override
    public TableOrderResponse updateTableOrderItem(Integer tableId, Integer dishId, Integer quantity) {
        Order order = orderRepository.findPendingOrderByTableId(tableId)
                .orElseThrow(() -> new ResourceNotFoundException("No pending order found"));

        OrderDetail detail = orderDetailRepository.findByOrderIdAndDishId(order.getOrderId(), dishId)
                .orElseThrow(() -> new ResourceNotFoundException("Order item not found"));

        detail.setQuantity(quantity);
        orderDetailRepository.save(detail);
        updateOrderTotals(order);

        return convertToTableOrderResponse(order);
    }

    @Override
    public TableOrderResponse removeTableOrderItem(Integer tableId, Integer dishId) {
        Order order = orderRepository.findPendingOrderByTableId(tableId)
                .orElseThrow(() -> new ResourceNotFoundException("No pending order found"));

        OrderDetail detail = orderDetailRepository.findByOrderIdAndDishId(order.getOrderId(), dishId)
                .orElseThrow(() -> new ResourceNotFoundException("Order item not found"));

        orderDetailRepository.delete(detail);
        updateOrderTotals(order);

        return convertToTableOrderResponse(order);
    }

    @Override
    public void cancelTableOrder(Integer tableId) {
        Order order = orderRepository.findPendingOrderByTableId(tableId)
                .orElseThrow(() -> new ResourceNotFoundException("No pending order found"));
        order.setStatusId(4); // Cancelled
        orderRepository.save(order);
    }

    // Methods for merged tables
    @Override
    public List<Order> getOrdersByTableGroup(Integer tableGroupId) {
        try {
            return orderRepository.findByTableGroupId(tableGroupId);
        } catch (Exception e) {
            System.err.println("Error getting orders by table group: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    @Override
    public List<Order> getActiveOrdersByTableGroup(Integer tableGroupId) {
        try {
            List<Integer> activeStatuses = Arrays.asList(1, 2); // Pending and Confirmed
            return orderRepository.findByTableGroupIdAndStatusIdIn(tableGroupId, activeStatuses);
        } catch (Exception e) {
            System.err.println("Error getting active orders by table group: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    @Override
    public TableOrderResponse addMergedTableOrderItem(Integer tableGroupId, Integer dishId, Integer quantity) {
        try {
            System.out.println("Adding order item to merged table group: " + tableGroupId + ", dish: " + dishId + ", quantity: " + quantity);
            
            // Find or create pending order for the table group
            Optional<Order> existingOrderOpt = orderRepository.findActiveOrderByTableGroupId(tableGroupId);
            Order order;
            
            if (existingOrderOpt.isPresent()) {
                order = existingOrderOpt.get();
                System.out.println("Found existing order: " + order.getOrderId());
            } else {
                // Create new order for merged table
                order = Order.builder()
                    .orderType("DINE_IN")
                    .tableGroupId(tableGroupId)
                    .tableId(null) // No specific table for merged orders
                    .statusId(1) // Pending
                    .subTotal(BigDecimal.ZERO)
                    .discountAmount(BigDecimal.ZERO)
                    .finalTotal(BigDecimal.ZERO)
                    .isRefunded(0)
                    .createdAt(LocalDateTime.now())
                    .build();
                order = orderRepository.save(order);
                System.out.println("Created new order for merged table: " + order.getOrderId());
            }
            
            // Add order detail
            Dish dish = dishRepository.findById(dishId)
                .orElseThrow(() -> new IllegalArgumentException("Dish not found: " + dishId));
            
            OrderDetail orderDetail = OrderDetail.builder()
                .order(order)
                .dish(dish)
                .quantity(quantity)
                .unitPrice(dish.getPrice())
                .notes("")
                .statusId(1) // Pending
                .build();
            
            orderDetail = orderDetailRepository.save(orderDetail);
            
            // Update order totals
            updateOrderTotals(order);
            
            return new TableOrderResponse(
                order.getOrderId(),
                orderDetail.getOrderDetailId(),
                "Item added to merged table successfully"
            );
            
        } catch (Exception e) {
            System.err.println("Error adding item to merged table: " + e.getMessage());
            throw new RuntimeException("Failed to add item to merged table: " + e.getMessage());
        }
    }

    @Override
    public List<Object> getActiveOrderItemsByMergedTable(Integer tableGroupId) {
        try {
            System.out.println("Getting active order items for merged table group: " + tableGroupId);
            
            List<Order> activeOrders = getActiveOrdersByTableGroup(tableGroupId);
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
                    item.put("tableGroupId", tableGroupId);
                    
                    result.add(item);
                }
            }
            
            System.out.println("Found " + result.size() + " active items for merged table group");
            return result;
            
        } catch (Exception e) {
            System.err.println("Error getting active order items for merged table: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    private Order findOrCreatePendingOrder(Integer tableId) {
        return orderRepository.findPendingOrderByTableId(tableId)
                .orElseGet(() -> {
                    Order newOrder = new Order();
                    newOrder.setOrderType("DINE_IN");
                    newOrder.setTableId(tableId);
                    newOrder.setStatusId(1); // Pending
                    newOrder.setSubTotal(BigDecimal.ZERO);
                    newOrder.setDiscountAmount(BigDecimal.ZERO);
                    newOrder.setFinalTotal(BigDecimal.ZERO);
                    return orderRepository.save(newOrder);
                });
    }

    private void updateOrderTotals(Order order) {
        try {
            List<OrderDetail> orderDetails = orderDetailRepository.findByOrder_OrderId(order.getOrderId());
            
            BigDecimal subTotal = orderDetails.stream()
                .map(detail -> detail.getUnitPrice().multiply(BigDecimal.valueOf(detail.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            order.setSubTotal(subTotal);
            order.setFinalTotal(subTotal.subtract(order.getDiscountAmount() != null ? order.getDiscountAmount() : BigDecimal.ZERO));
            
            orderRepository.save(order);
            
        } catch (Exception e) {
            System.err.println("Error updating order totals: " + e.getMessage());
        }
    }

    private TableOrderResponse convertToTableOrderResponse(Order order) {
        List<OrderDetail> details = orderDetailRepository.findByOrderId(order.getOrderId());

        TableOrderResponse response = new TableOrderResponse();
        response.setOrderId(order.getOrderId());
        response.setTableId(order.getTableId());
        response.setStatus(getStatusName(order.getStatusId()));
        response.setItems(details.stream()
                .map(this::convertToOrderItemRequest)
                .collect(Collectors.toList()));
        response.setSubTotal(order.getSubTotal());
        response.setDiscountAmount(order.getDiscountAmount());
        response.setFinalTotal(order.getFinalTotal());

        return response;
    }

    private OrderItemRequest convertToOrderItemRequest(OrderDetail detail) {
        OrderItemRequest item = new OrderItemRequest();
        item.setDishId(detail.getDishId());
        item.setComboId(detail.getComboId());
        item.setQuantity(detail.getQuantity());
        item.setUnitPrice(detail.getUnitPrice());
        item.setStatus(getStatusName(detail.getStatusId()));
        item.setNotes(detail.getNotes());
        return item;
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