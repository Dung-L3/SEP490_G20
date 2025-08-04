package com.system.restaurant.management.service.serviceImpl;

import com.system.restaurant.management.dto.KitchenOrderDTO;
import com.system.restaurant.management.entity.OrderDetail;
import com.system.restaurant.management.repository.OrderDetailRepository;
import com.system.restaurant.management.service.ChefService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChefServiceImpl implements ChefService {

    private final OrderDetailRepository orderDetailRepository;

    @Override
    public List<KitchenOrderDTO> getPendingOrders() {
        try {
            return orderDetailRepository.findByStatusId(1)
                    .stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching pending orders: ", e);
            return List.of();
        }
    }

    private KitchenOrderDTO convertToDTO(OrderDetail orderDetail) {
        KitchenOrderDTO dto = new KitchenOrderDTO();
        dto.setOrderDetailId(orderDetail.getOrderDetailId());
        dto.setOrderId(orderDetail.getOrderId());
        
        // Xử lý dish name an toàn
        String dishName = "Món không xác định";
        if (orderDetail.getDish() != null && orderDetail.getDish().getDishName() != null) {
            dishName = orderDetail.getDish().getDishName();
        } else if (orderDetail.getDishName() != null) {
            dishName = orderDetail.getDishName();
        }
        dto.setDishName(dishName);
        
        dto.setQuantity(orderDetail.getQuantity());
        dto.setStatus(getStatusText(orderDetail.getStatusId()));
        dto.setNotes(orderDetail.getNotes() != null ? orderDetail.getNotes() : "");

        // Xử lý table name và order time an toàn
        if (orderDetail.getOrder() != null) {
            if (orderDetail.getOrder().getTable() != null && orderDetail.getOrder().getTable().getTableName() != null) {
                dto.setTableNumber(orderDetail.getOrder().getTable().getTableName());
            } else {
                dto.setTableNumber("Bàn không xác định");
            }
            dto.setOrderTime(orderDetail.getOrder().getCreatedAt());
        } else {
            dto.setTableNumber("Bàn không xác định");
            dto.setOrderTime(java.time.LocalDateTime.now());
        }

        return dto;
    }

    private String getStatusText(Integer statusId) {
        return switch (statusId) {
            case 1 -> "PENDING";
            case 2 -> "COOKING";
            case 3 -> "COMPLETED";
            default -> "UNKNOWN";
        };
    }
}
