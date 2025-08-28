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

        // ... giữ nguyên phần tạo Order ...

        BigDecimal subTotal = BigDecimal.ZERO;

        for (var it : req.getItems()) {
            Integer dishId  = it.getDishId();
            Integer comboId = it.getComboId();

            // CHỈ 1 loại: dish XOR combo
            if ((dishId == null && comboId == null) || (dishId != null && comboId != null)) {
                throw new IllegalArgumentException("Mỗi món phải CHỈ chọn 1: dishId hoặc comboId.");
            }
            int reqQty = (it.getQuantity() == null || it.getQuantity() <= 0) ? 1 : it.getQuantity();

            // ===== MÓN LẺ =====
            if (dishId != null) {
                Dish d = dishRepo.findById(dishId)
                        .orElseThrow(() -> new IllegalArgumentException("Dish not found: " + dishId));

                OrderDetail od = new OrderDetail();
                od.setOrderId(order.getOrderId());      // dùng cột thô vì mapping insertable=false
                od.setDishId(d.getDishId());            // KHÔNG để null
                od.setComboId(null);
                od.setQuantity(reqQty);
                od.setUnitPrice(d.getPrice());          // luôn lấy từ DB
                od.setNotes(it.getNotes());
                od.setStatusId(1);
                orderDetailRepo.save(od);

                subTotal = subTotal.add(d.getPrice().multiply(BigDecimal.valueOf(reqQty)));
                continue;
            }

            // ===== COMBO =====
            Combo combo = comboRepo.findByIdWithDetails(comboId)
                    .orElseThrow(() -> new IllegalArgumentException("Combo not found: " + comboId));

            if (combo.getComboItems() == null || combo.getComboItems().isEmpty()) {
                throw new IllegalArgumentException("Combo không có món: " + comboId);
            }

            boolean first = true; // dòng đầu gánh giá combo
            for (var ci : combo.getComboItems()) {
                Dish dish = ci.getDish();
                if (dish == null) {
                    throw new IllegalStateException("ComboItem thiếu dish trong combo " + comboId);
                }
                int perComboQty = (ci.getQuantity() == null || ci.getQuantity() <= 0) ? 1 : ci.getQuantity();
                int totalDishQty = perComboQty * reqQty;

                OrderDetail od = new OrderDetail();
                od.setOrderId(order.getOrderId());
                od.setDishId(dish.getDishId());         // bắt buộc có DishID
                od.setComboId(combo.getComboId());      // lưu dấu vết thuộc combo
                od.setQuantity(totalDishQty);
                od.setNotes(((it.getNotes() != null) ? it.getNotes() + " | " : "") + "Thuộc combo " + combo.getComboName());
                od.setStatusId(1);

                if (first) {
                    od.setUnitPrice(combo.getPrice());  // chỉ dòng đầu có giá combo
                    subTotal = subTotal.add(combo.getPrice().multiply(BigDecimal.valueOf(reqQty)));
                    first = false;
                } else {
                    od.setUnitPrice(BigDecimal.ZERO);   // các dòng còn lại 0đ
                }

                orderDetailRepo.save(od);
            }
        }

// cập nhật tổng tiền
        order.setSubTotal(subTotal);
        order.setFinalTotal(subTotal);
        orderRepo.save(order);


        return order.getOrderId();
    }
}
