package com.system.restaurant.management.service.serviceImpl;

import com.system.restaurant.management.dto.KitchenOrderDTO;
import com.system.restaurant.management.entity.OrderDetail;
import com.system.restaurant.management.repository.OrderDetailRepository;
import com.system.restaurant.management.service.ChefService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChefServiceImpl implements ChefService {

    private final OrderDetailRepository orderDetailRepository;

    @Override
    public List<KitchenOrderDTO> getPendingOrders() {
        return orderDetailRepository.findByStatusId(1)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<KitchenOrderDTO> getCookingOrders() {
        return orderDetailRepository.findByStatusId(2)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public KitchenOrderDTO updateOrderStatus(Integer orderDetailId, Integer statusId) {
        OrderDetail orderDetail = orderDetailRepository.findById(orderDetailId)
                .orElseThrow(() -> new RuntimeException("Order detail not found"));
        orderDetail.setStatusId(statusId);
        return convertToDTO(orderDetailRepository.save(orderDetail));
    }

    private KitchenOrderDTO convertToDTO(OrderDetail orderDetail) {
        KitchenOrderDTO dto = new KitchenOrderDTO();
        dto.setOrderDetailId(orderDetail.getOrderDetailId());
        dto.setOrderId(orderDetail.getOrderId());
        dto.setDishName(orderDetail.getDishName());
        dto.setQuantity(orderDetail.getQuantity());
        dto.setStatus(getStatusText(orderDetail.getStatusId()));

        // Safely get table name and order time
        if (orderDetail.getOrder() != null) {
            if (orderDetail.getOrder().getTable() != null) {
                dto.setTableNumber(orderDetail.getOrder().getTable().getTableName());
            }
            dto.setOrderTime(orderDetail.getOrder().getCreatedAt());
        }

        dto.setNotes(orderDetail.getNotes());
        return dto;
    }

    private String getStatusText(Integer statusId) {
        return switch (statusId) {
            case 1 -> "PENDING";
            case 2 -> "COOKING";
            case 3 -> "COMPLETED";
            case 4 -> "SERVED";
            default -> "UNKNOWN";
        };
    }
}
