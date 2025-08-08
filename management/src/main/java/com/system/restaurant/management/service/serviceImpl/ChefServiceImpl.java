package com.system.restaurant.management.service.serviceImpl;

import com.system.restaurant.management.dto.KitchenOrderDTO;
import com.system.restaurant.management.entity.OrderDetail;
import com.system.restaurant.management.repository.OrderDetailRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class ChefServiceImpl {

    private final OrderDetailRepository orderDetailRepository;

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
        dto.setOrderId(orderDetail.getOrderId());
        
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

    public List<Map<String, Object>> getPendingKitchenOrders() {
        try {
            // Get pending order details (status = 1)
            List<OrderDetail> pendingDetails = orderDetailRepository.findByStatusId(1);
            
            return pendingDetails.stream().map(detail -> {
                Map<String, Object> orderMap = new HashMap<>();
                orderMap.put("orderDetailId", detail.getOrderDetailId());
                orderMap.put("orderId", detail.getOrderId());
                orderMap.put("dishName", detail.getDish() != null ? detail.getDish().getDishName() : "Unknown");
                orderMap.put("quantity", detail.getQuantity());
                orderMap.put("status", "pending");
                orderMap.put("notes", detail.getNotes() != null ? detail.getNotes() : "");
                
                // Get table information
                String tableNumber = "Bàn không xác định";
                if (detail.getOrder() != null) {
                    if (detail.getOrder().getTableId() != null) {
                        // Use table from order relationship if available
                        if (detail.getOrder().getTable() != null) {
                            tableNumber = detail.getOrder().getTable().getTableName();
                        } else {
                            tableNumber = "Bàn " + detail.getOrder().getTableId();
                        }
                    } else if (detail.getOrder().getTableGroupId() != null) {
                        tableNumber = "Bàn ghép " + detail.getOrder().getTableGroupId();
                    }
                }
                orderMap.put("tableNumber", tableNumber);
                
                // Order time
                String orderTime = detail.getOrder() != null && detail.getOrder().getCreatedAt() != null
                    ? detail.getOrder().getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
                    : new Date().toString();
                orderMap.put("orderTime", orderTime);
                
                return orderMap;
            }).collect(Collectors.toList());
            
        } catch (Exception e) {
            System.err.println("Error getting pending kitchen orders: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    public void updateOrderDetailStatus(Integer orderDetailId, String status) {
        try {
            OrderDetail detail = orderDetailRepository.findById(orderDetailId)
                .orElseThrow(() -> new RuntimeException("Order detail not found"));
            
            // Convert status string to statusId
            Integer statusId = switch (status.toLowerCase()) {
                case "pending" -> 1;
                case "processing", "cooking" -> 2;
                case "completed", "done" -> 3;
                case "cancelled" -> 4;
                default -> throw new IllegalArgumentException("Invalid status: " + status);
            };
            
            detail.setStatusId(statusId);
            orderDetailRepository.save(detail);
            
            System.out.println("Updated order detail " + orderDetailId + " to status " + status);
            
        } catch (Exception e) {
            System.err.println("Error updating order detail status: " + e.getMessage());
            throw new RuntimeException("Failed to update order status: " + e.getMessage());
        }
    }
}
