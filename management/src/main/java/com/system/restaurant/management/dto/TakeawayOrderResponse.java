package com.system.restaurant.management.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TakeawayOrderResponse {
    private Integer orderId;
    private String customerName;
    private String phone;
    private String notes;                // ghi chú của cả order
    private BigDecimal subTotal;
    private BigDecimal discountAmount;
    private BigDecimal finalTotal;
    private List<OrderDetailDTO> items;  // danh sách món ăn

//    public static TakeawayOrderResponse fromEntity(com.system.restaurant.management.entity.Order order) {
//        // map từng OrderDetail ➡️ OrderDetailDTO
//        List<OrderDetailDTO> dtos = order.getOrderDetails().stream()
//                .map(OrderDetailDTO::fromEntity)
//                .toList();
//
//        return TakeawayOrderResponse.builder()
//                .orderId(order.getOrderId())
//                .customerName(order.getCustomerName())
//                .phone(order.getPhone())
//                .notes(order.getNotes())
//                .subTotal(order.getSubTotal())
//                .discountAmount(order.getDiscountAmount())
//                .finalTotal(order.getFinalTotal())
//                .items(dtos)
//                .build();
//    }
}
