package com.system.restaurant.management.service.serviceImpl;

import com.system.restaurant.management.dto.OrderDto;
import com.system.restaurant.management.entity.Order;
import com.system.restaurant.management.entity.OrderStatus;
import com.system.restaurant.management.repository.OrderRepository;
import com.system.restaurant.management.repository.OrderStatusRepository;
import com.system.restaurant.management.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderServiceImpl implements OrderService {
    private final OrderRepository orderRepo;
    private final OrderStatusRepository statusRepo;

    public OrderServiceImpl(OrderRepository orderRepo, OrderStatusRepository statusRepo) {
        this.orderRepo = orderRepo;
        this.statusRepo = statusRepo;
    }

    @Override
    public List<OrderDto> getUnpaidOrders() {
        // 1) Tìm lookup status "Pending"
        OrderStatus pending = statusRepo.findByStatusName("Pending")
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Pending status not found"));

        Integer pendingId = pending.getStatusId();

        // 2) Lấy danh sách Order có statusId = pendingId
        List<Order> orders = orderRepo.findByStatusId(pendingId);

        // 3) Map sang DTO
        return orders.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private OrderDto mapToDto(Order order) {
        OrderDto dto = new OrderDto();
        dto.setOrderId(order.getOrderId());
        dto.setOrderType(order.getOrderType());
        dto.setCustomerName(order.getCustomerName());
        // mapping tới RestaurantTable table; cần @ManyToOne trong entity Order
        dto.setTableName(order.getTable() != null
                ? order.getTable().getTableName()
                : null);
        dto.setSubTotal(order.getSubTotal());
        dto.setDiscountAmount(order.getDiscountAmount());
        dto.setFinalTotal(order.getFinalTotal());
        dto.setCreatedAt(order.getCreatedAt());
        return dto;
    }

}
