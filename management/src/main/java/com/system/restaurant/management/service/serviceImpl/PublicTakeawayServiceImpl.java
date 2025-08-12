package com.system.restaurant.management.service.serviceImpl;

import com.system.restaurant.management.dto.CreateTakeawayOrderRequest;
import com.system.restaurant.management.entity.*;
import com.system.restaurant.management.repository.*;
import com.system.restaurant.management.service.PublicTakeawayService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class PublicTakeawayServiceImpl implements PublicTakeawayService {

    private final OrderRepository orderRepo;
    private final OrderDetailRepository orderDetailRepo;
    private final DishRepository dishRepo;
    private final ComboRepository comboRepo; // nếu có

    @Override
    public Integer createTakeawayOrder(CreateTakeawayOrderRequest req) {
        Order order = new Order();
        order.setOrderType("TAKEAWAY");          // << quan trọng để /chef filter
        order.setCustomerName(req.getCustomerName());
        order.setPhone(req.getPhone());
        order.setNotes(req.getNotes());
        order.setCreatedAt(LocalDateTime.now());
        order.setTable(null);                    // không gán bàn
        order.setSubTotal(BigDecimal.ZERO);
        order.setDiscountAmount(BigDecimal.ZERO);
        order.setFinalTotal(BigDecimal.ZERO);
        order = orderRepo.save(order);

        BigDecimal subTotal = BigDecimal.ZERO;

        for (var it : req.getItems()) {
            BigDecimal unitPrice;

            if (it.getDishId() != null) {
                Dish d = dishRepo.findById(it.getDishId())
                        .orElseThrow(() -> new IllegalArgumentException("Dish not found: " + it.getDishId()));
                unitPrice = d.getPrice();
            } else {
                Combo c = comboRepo.findById(it.getComboId())
                        .orElseThrow(() -> new IllegalArgumentException("Combo not found: " + it.getComboId()));
                unitPrice = c.getPrice();
            }

            OrderDetail od = new OrderDetail();
            od.setOrder(order);
            od.setDishId(it.getDishId());
            od.setComboId(it.getComboId());
            od.setQuantity(it.getQuantity());
            od.setUnitPrice(unitPrice);      // LUÔN lấy từ DB
            od.setNotes(it.getNotes());
            od.setStatusId(1);               // 1 = PENDING => hiện bên /chef
            orderDetailRepo.save(od);

            subTotal = subTotal.add(unitPrice.multiply(BigDecimal.valueOf(it.getQuantity())));
        }

        order.setSubTotal(subTotal);
        order.setFinalTotal(subTotal);
        orderRepo.save(order);

        return order.getOrderId();
    }
}
