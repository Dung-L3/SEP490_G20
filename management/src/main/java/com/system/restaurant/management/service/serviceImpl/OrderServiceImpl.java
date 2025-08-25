package com.system.restaurant.management.service.serviceImpl;

import com.system.restaurant.management.dto.OrderDto;
import com.system.restaurant.management.dto.OrderRequestDto;
import com.system.restaurant.management.dto.TableOrderRequest;
import com.system.restaurant.management.dto.TableOrderResponse;
import com.system.restaurant.management.dto.OrderItemRequest;
import com.system.restaurant.management.entity.*;
import com.system.restaurant.management.exception.ResourceNotFoundException;
import com.system.restaurant.management.repository.*;
import com.system.restaurant.management.service.OrderService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import java.util.HashMap;
import java.util.Map;

@Service
@Transactional
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {
    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final DishRepository dishRepository;
    private final OrderStatusRepository statusRepo;
    private final ComboItemRepository comboItemRepository;

    // ====== QR MENU METHODS ======
    @Override
    public List<OrderDto> findAll() {
        List<Order> orders = orderRepository.findAll();
        return orders.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void updateOrderPhone(Integer orderId, String phone) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Order không tồn tại với id = " + orderId));

        String normalized = phone.trim();
        if (normalized.length() > 20) {
            normalized = normalized.substring(0, 20); // đảm bảo fit cột NVARCHAR(20)
        }
        order.setPhone(normalized);
        orderRepository.save(order);
    }

    @Override
    public OrderRequestDto createOrder(OrderRequestDto orderDto) {
        try {
            // Tạo Order entity từ DTO
            Order order = new Order();
            order.setOrderType(orderDto.getOrderType() != null ? orderDto.getOrderType() : "DINEIN");
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
            // Tìm order đang active của bàn (status = 1 hoặc 2: Pending hoặc Processing)
            List<Order> activeOrders = orderRepository.findByTableIdAndStatusIdIn(tableId, List.of(1, 2));
            
            if (activeOrders.isEmpty()) {
                return List.of(); // Trả về danh sách rỗng nếu không có order
            }

            // Lấy order details từ các active orders
            return activeOrders.stream()
                    .flatMap(order -> {
                        List<OrderDetail> details = orderDetailRepository.findByOrderId(order.getOrderId());
                        return details.stream().map(detail -> {
                            Map<String, Object> item = new HashMap<>();
                            
                            // Lấy thông tin dish
                            Dish dish = dishRepository.findById(detail.getDishId()).orElse(null);
                            
                            item.put("orderDetailId", detail.getOrderDetailId());
                            item.put("dishId", detail.getDishId());
                            item.put("dishName", dish != null ? dish.getDishName() : "Unknown");
                            item.put("quantity", detail.getQuantity());
                            item.put("unitPrice", detail.getUnitPrice());
                            item.put("imageUrl", dish != null ? dish.getImageUrl() : null);
                            item.put("status", getStatusName(detail.getStatusId()).toLowerCase());
                            item.put("orderStatus", getStatusName(detail.getStatusId()).toLowerCase());
                            item.put("notes", detail.getNotes());
                            
                            return item;
                        });
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error fetching active order items for table " + tableId + ": " + e.getMessage());
            return List.of(); // Trả về danh sách rỗng nếu có lỗi
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
        OrderStatus pending = statusRepo.findByStatusName("Pending")
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Pending status not found"));

        Integer pendingId = pending.getStatusId();
        List<Order> orders = orderRepository.findByStatusId(pendingId);
        return orders.stream()
                .sorted(Comparator.comparing(Order::getOrderId).reversed())
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public void cancelOrderDetail(Integer orderDetailId) {
        OrderDetail detail = orderDetailRepository.findById(orderDetailId)
                .orElseThrow(() -> new ResourceNotFoundException("Order detail not found"));
        detail.setStatusId(4); // Cancelled
        orderDetailRepository.save(detail);
        
        // Cập nhật lại tổng tiền của order
        Order order = orderRepository.findById(detail.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        updateOrderTotals(order);
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
        dto.setNotes(order.getNotes());
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
        Order order = findOrCreatePendingOrder(request.getTableId());
        OrderItemRequest item = request.getItem();

        if (item.getComboId() != null) {
            // Lấy danh sách các món trong combo
            List<ComboItem> comboItems = comboItemRepository.findByComboId(item.getComboId());
            BigDecimal comboPricePerUnit = item.getUnitPrice();
            
            // Tính giá cho mỗi món trong combo dựa trên tỷ lệ
            int totalQuantityInCombo = comboItems.stream()
                .mapToInt(ComboItem::getQuantity)
                .sum();
                
            for (ComboItem comboItem : comboItems) {
                OrderDetail detail = new OrderDetail();
                detail.setOrderId(order.getOrderId());
                detail.setDishId(comboItem.getDishId());
                detail.setComboId(item.getComboId()); // Thêm ComboId
                detail.setQuantity(item.getQuantity() * comboItem.getQuantity());
                
                // Tính giá cho từng món trong combo
                BigDecimal ratio = BigDecimal.valueOf(comboItem.getQuantity())
                    .divide(BigDecimal.valueOf(totalQuantityInCombo), 2, BigDecimal.ROUND_HALF_UP);
                detail.setUnitPrice(comboPricePerUnit.multiply(ratio));
                
                detail.setStatusId(1); // Pending
                detail.setNotes("Combo: " + item.getNotes());
                detail.setIsRefunded(0); // Thêm IsRefunded
                orderDetailRepository.save(detail);
            }
        } else {
            // Xử lý món đơn lẻ như trước
            OrderDetail detail = new OrderDetail();
            detail.setOrderId(order.getOrderId());
            detail.setDishId(item.getDishId());
            detail.setQuantity(item.getQuantity());
            detail.setUnitPrice(item.getUnitPrice());
            detail.setStatusId(1); // Pending
            detail.setNotes(item.getNotes());
            detail.setIsRefunded(0);
            orderDetailRepository.save(detail);
        }

        updateOrderTotals(order);
        return convertToTableOrderResponse(order);
    }

    @Override
    public TableOrderResponse updateTableOrderItem(Integer tableId, Integer dishId, Integer quantity) {
        List<Order> pendingOrders = orderRepository.findPendingOrdersByTableId(tableId);
        if (pendingOrders.isEmpty()) {
            throw new ResourceNotFoundException("No pending order found");
        }
        Order order = pendingOrders.get(0); // Get most recent order

        OrderDetail detail = orderDetailRepository.findByOrderIdAndDishId(order.getOrderId(), dishId)
                .orElseThrow(() -> new ResourceNotFoundException("Order item not found"));

        detail.setQuantity(quantity);
        orderDetailRepository.save(detail);
        updateOrderTotals(order);

        return convertToTableOrderResponse(order);
    }

    @Override
    public TableOrderResponse removeTableOrderItem(Integer tableId, Integer dishId) {
        List<Order> pendingOrders = orderRepository.findPendingOrdersByTableId(tableId);
        if (pendingOrders.isEmpty()) {
            throw new ResourceNotFoundException("No pending order found");
        }
        Order order = pendingOrders.get(0); // Get most recent order

        OrderDetail detail = orderDetailRepository.findByOrderIdAndDishId(order.getOrderId(), dishId)
                .orElseThrow(() -> new ResourceNotFoundException("Order item not found"));

        orderDetailRepository.delete(detail);
        updateOrderTotals(order);

        return convertToTableOrderResponse(order);
    }

    @Override
    public void cancelTableOrder(Integer tableId) {
        List<Order> pendingOrders = orderRepository.findPendingOrdersByTableId(tableId);
        if (!pendingOrders.isEmpty()) {
            Order order = pendingOrders.get(0); // Get most recent order
            order.setStatusId(4); // Cancelled
            orderRepository.save(order);
        }
    }

    private Order findOrCreatePendingOrder(Integer tableId) {
        List<Order> pendingOrders = orderRepository.findPendingOrdersByTableId(tableId);
        
        if (!pendingOrders.isEmpty()) {
            // Lấy order mới nhất (đã được sắp xếp theo createdAt DESC)
            return pendingOrders.get(0);
        }

        // Tạo order mới nếu không tìm thấy
        Order newOrder = new Order();
        newOrder.setOrderType("DINEIN");
        newOrder.setTableId(tableId);
        newOrder.setStatusId(1); // Pending
        newOrder.setSubTotal(BigDecimal.ZERO);
        newOrder.setDiscountAmount(BigDecimal.ZERO);
        newOrder.setFinalTotal(BigDecimal.ZERO);
        newOrder.setCreatedAt(LocalDateTime.now());
        newOrder.setIsRefunded(0);
        return orderRepository.save(newOrder);
    }

    private void updateOrderTotals(Order order) {
        List<OrderDetail> details = orderDetailRepository.findByOrderId(order.getOrderId());
        BigDecimal subTotal = details.stream()
                .filter(detail -> detail.getStatusId() != 4) // Chỉ tính các món không bị hủy
                .map(detail -> detail.getUnitPrice().multiply(BigDecimal.valueOf(detail.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        order.setSubTotal(subTotal);
        order.setFinalTotal(subTotal.subtract(order.getDiscountAmount()));
        orderRepository.save(order);
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
}