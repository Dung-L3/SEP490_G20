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
            List<OrderDetail> orderDetails = orderDetailRepository.findByStatusIdWithDetails(1);
            log.info("Found {} pending order details", orderDetails.size());
            
            return orderDetails.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching pending orders: ", e);
            return List.of();
        }
    }

    @Override
    public void updateOrderStatus(Integer orderDetailId, String status) {
        try {
            OrderDetail orderDetail = orderDetailRepository.findById(orderDetailId)
                    .orElseThrow(() -> new RuntimeException("Order detail not found with ID: " + orderDetailId));
            
            Integer statusId = getStatusId(status);
            orderDetail.setStatusId(statusId);
            orderDetailRepository.save(orderDetail);
            
            log.info("Updated order detail {} status to {}", orderDetailId, status);
        } catch (Exception e) {
            log.error("Error updating order status: ", e);
            throw new RuntimeException("Failed to update order status", e);
        }
    }

    private KitchenOrderDTO convertToDTO(OrderDetail orderDetail) {
        KitchenOrderDTO dto = new KitchenOrderDTO();
        dto.setOrderDetailId(orderDetail.getOrderDetailId());
        dto.setOrderId(orderDetail.getOrder() != null ? orderDetail.getOrder().getOrderId() : orderDetail.getOrderId());
        
        // Xử lý dish name an toàn
        String dishName = "Món không xác định";
        if (orderDetail.getDish() != null && orderDetail.getDish().getDishName() != null) {
            dishName = orderDetail.getDish().getDishName();
        }
        dto.setDishName(dishName);
        
        dto.setQuantity(orderDetail.getQuantity());
        dto.setStatus(getStatusText(orderDetail.getStatusId()));
        dto.setNotes(orderDetail.getNotes() != null ? orderDetail.getNotes() : "");

        // Xử lý table name với debug log
        String tableName = "Bàn không xác định";
        try {
            if (orderDetail.getOrder() != null) {
                log.debug("Order found: {}", orderDetail.getOrder().getOrderId());
                if (orderDetail.getOrder().getTable() != null) {
                    log.debug("Table found: {}", orderDetail.getOrder().getTable().getTableId());
                    if (orderDetail.getOrder().getTable().getTableName() != null) {
                        tableName = orderDetail.getOrder().getTable().getTableName();
                        log.debug("Table name: {}", tableName);
                        var o = orderDetail.getOrder();

                        // ƯU TIÊN: nếu là TAKEAWAY -> luôn hiển thị "Mang đi"
                        if ("TAKEAWAY".equalsIgnoreCase(o.getOrderType())) {
                            tableName = "Mang đi";
                        } else if (o.getTable() != null && o.getTable().getTableName() != null) {
                            // DINE-IN có bàn
                            tableName = o.getTable().getTableName();
                        }

                        dto.setOrderTime(o.getCreatedAt());
                    } else {
                        log.warn("Table name is null for table ID: {}", orderDetail.getOrder().getTable().getTableId());
                    }
                } else {
                    log.warn("Table is null for order ID: {}", orderDetail.getOrder().getOrderId());
                }
                dto.setOrderTime(orderDetail.getOrder().getCreatedAt());
            } else {
                log.warn("Order is null for order detail ID: {}", orderDetail.getOrderDetailId());
                dto.setOrderTime(java.time.LocalDateTime.now());
            }
        } catch (Exception e) {
            log.error("Error processing table info for order detail {}: ", orderDetail.getOrderDetailId(), e);
        }
        
        dto.setTableNumber(tableName);
        return dto;
    }

    private String getStatusText(Integer statusId) {
        return switch (statusId) {
            case 1 -> "PENDING";
            case 2 -> "PROCESSING";
            case 3 -> "COMPLETED";
            default -> "UNKNOWN";
        };
    }

    private Integer getStatusId(String status) {
        return switch (status.toUpperCase()) {
            case "PENDING" -> 1;
            case "PROCESSING" -> 2;
            case "COMPLETED" -> 3;
            default -> throw new IllegalArgumentException("Invalid status: " + status);
        };
    }
}
