package com.system.restaurant.management.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TakeawayOrderResponse {
    private Integer orderId;
    private String customerName;
    private String phone;
    private String notes;
    private BigDecimal subTotal;
    private BigDecimal discountAmount;
    private BigDecimal finalTotal;
    private List<OrderDetailDTO> items;

    @Builder.Default
    private List<OrderDetailDTO> item = Collections.emptyList();

    public static TakeawayOrderResponse of(
            com.system.restaurant.management.entity.Order order,
            List<com.system.restaurant.management.entity.OrderDetail> details
    ) {
        List<OrderDetailDTO> dtos = details == null ? Collections.emptyList()
                : details.stream().map(OrderDetailDTO::fromEntity).toList();

        BigDecimal sub = Objects.requireNonNullElse(order.getSubTotal(), BigDecimal.ZERO);
        BigDecimal disc = Objects.requireNonNullElse(order.getDiscountAmount(), BigDecimal.ZERO);
        BigDecimal finalTotal = Objects.requireNonNullElse(order.getFinalTotal(), sub.subtract(disc));

        return TakeawayOrderResponse.builder()
                .orderId(order.getOrderId())
                .customerName(order.getCustomerName())
                .phone(order.getPhone())
                .notes(order.getNotes())
                .subTotal(sub)
                .discountAmount(disc)
                .finalTotal(finalTotal)
                .items(dtos)
                .build();
    }

    public static TakeawayOrderResponse of(com.system.restaurant.management.entity.Order order) {
        return of(order, order.getOrderDetails());
    }

}
