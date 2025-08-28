package com.system.restaurant.management.service.serviceImpl;

import com.system.restaurant.management.dto.ApplyPromotionRequest;
import com.system.restaurant.management.dto.ApplyPromotionResponse;
import com.system.restaurant.management.dto.PromotionRequestDto;
import com.system.restaurant.management.entity.Customer;
import com.system.restaurant.management.entity.Order;
import com.system.restaurant.management.entity.PromoUsage;
import com.system.restaurant.management.entity.Promotion;
import com.system.restaurant.management.repository.CustomerRepository;
import com.system.restaurant.management.repository.OrderRepository;
import com.system.restaurant.management.repository.PromoUsageRepository;
import com.system.restaurant.management.repository.PromotionRepository;
import com.system.restaurant.management.service.PromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.data.domain.*;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.*;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

import static org.springframework.http.HttpStatus.*;

@Service
@RequiredArgsConstructor
public class PromotionServiceImpl implements PromotionService {

     private final PromotionRepository promotionRepository;
     private final PromoUsageRepository promoUsageRepository;
     private final OrderRepository orderRepository;

    @Override
    public Promotion create(PromotionRequestDto dto) {
        Promotion p = new Promotion();
        applyDto(p, dto);
        promotionRepository.findByPromoCodeIgnoreCase(dto.getPromoCode())
                .ifPresent(x -> { throw new ResponseStatusException(CONFLICT, "Promo code already exists"); });
        return promotionRepository.save(p);
    }

    @Override
    public Promotion update(Integer promoId, PromotionRequestDto dto) {
        Promotion p = promotionRepository.findById(promoId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Promotion not found"));
        // nếu đổi promoCode, check unique
        if (!p.getPromoCode().equalsIgnoreCase(dto.getPromoCode())) {
            promotionRepository.findByPromoCodeIgnoreCase(dto.getPromoCode())
                    .ifPresent(x -> { throw new ResponseStatusException(CONFLICT, "Promo code already exists"); });
        }
        applyDto(p, dto);
        return promotionRepository.save(p);
    }

    @Override
    public void delete(Integer promoId) {
        try {
            promotionRepository.deleteById(promoId);
        } catch (EmptyResultDataAccessException ex) {
            throw new ResponseStatusException(NOT_FOUND, "Promotion not found");
        }
    }

    @Override
    public Promotion get(Integer promoId) {
        return promotionRepository.findById(promoId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Promotion not found"));
    }

    @Override
    public Page<Promotion> list(Pageable pageable) {
        return promotionRepository.findAll(pageable);
    }

    public List<Promotion> listValidPromotions() {
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Bangkok"));
        return promotionRepository.findAll().stream()
                .filter(p -> Boolean.TRUE.equals(p.getIsActive()))
                .filter(p -> !today.isBefore(p.getStartDate()))
                .filter(p -> !today.isAfter(p.getEndDate()))
                .filter(p -> p.getUsageLimit() == null || p.getUsageLimit() > 0)
                .sorted(Comparator.comparing(Promotion::getEndDate))
                .toList();
    }


    @Override
    @Transactional
    public ApplyPromotionResponse applyToOrder(ApplyPromotionRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Order not found"));

        // 1) khóa hàng của promotion để trừ UsageLimit an toàn
        Promotion promotion = promotionRepository.lockByPromoCode(request.getPromoCode())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Promotion code not found"));

        // 2) các kiểm tra nghiệp vụ
        LocalDate today = LocalDate.now(ZoneId.systemDefault());
        if (Boolean.FALSE.equals(promotion.getIsActive())) {
            throw new ResponseStatusException(BAD_REQUEST, "Promotion is inactive");
        }
        if (today.isBefore(promotion.getStartDate()) || today.isAfter(promotion.getEndDate())) {
            throw new ResponseStatusException(BAD_REQUEST, "Promotion is not valid on this date");
        }
        if (promotion.getUsageLimit() != null && promotion.getUsageLimit() <= 0) {
            throw new ResponseStatusException(BAD_REQUEST, "Promotion usage limit reached");
        }
        if (order.getSubTotal() == null) {
            throw new ResponseStatusException(BAD_REQUEST, "Order subtotal is missing");
        }

        // Nếu order đã có discount > 0 thì không cho áp thêm (tránh chồng mã)
        if (order.getDiscountAmount() != null && order.getDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
            throw new ResponseStatusException(BAD_REQUEST, "Order already has a discount; remove/override first");
        }

        // 3) tính discount (ưu tiên percent > 0, else fixed)
        BigDecimal subTotal = order.getSubTotal();
        BigDecimal discount = computeDiscount(subTotal, promotion.getDiscountPercent(), promotion.getDiscountAmount());
        if (discount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(BAD_REQUEST, "Promotion has no effective discount");
        }
        if (discount.compareTo(subTotal) > 0) discount = subTotal; // không âm

        // 4) cập nhật order
        order.setDiscountAmount(discount);
        order.setFinalTotal(subTotal.subtract(discount).max(BigDecimal.ZERO));
        orderRepository.save(order);

        // 5) trừ usageLimit (nếu có giới hạn)
        if (promotion.getUsageLimit() != null) {
            promotion.setUsageLimit(promotion.getUsageLimit() - 1);
        }
        promotionRepository.save(promotion);

        // 6) ghi PromoUsage
        PromoUsage usage = new PromoUsage();
        usage.setPromo(promotion);
        usage.setPhone(order.getPhone()); // null cho khách vãng lai
        usage.setUsedAt(LocalDateTime.now());
        promoUsageRepository.save(usage);

        return new ApplyPromotionResponse(
                order.getOrderId(),
                promotion.getPromoCode(),
                subTotal,
                discount,
                order.getFinalTotal()
        );
    }

    private void applyDto(Promotion p, PromotionRequestDto dto) {
        p.setPromoCode(dto.getPromoCode().trim());
        p.setPromoName(dto.getPromoName());
        p.setDescription(dto.getDescription());
        p.setDiscountPercent(safe(dto.getDiscountPercent()));
        p.setDiscountAmount(safe(dto.getDiscountAmount()));
        p.setStartDate(dto.getStartDate());
        p.setEndDate(dto.getEndDate());
        p.setUsageLimit(dto.getUsageLimit());
        p.setIsActive(dto.getIsActive());
    }

    private BigDecimal safe(BigDecimal v) {
        return v == null ? BigDecimal.ZERO : v;
    }

    private BigDecimal computeDiscount(BigDecimal subTotal, BigDecimal percent, BigDecimal fixed) {
        BigDecimal pct = percent == null ? BigDecimal.ZERO : percent;
        BigDecimal fxd = fixed   == null ? BigDecimal.ZERO : fixed;

        if (pct.compareTo(BigDecimal.ZERO) > 0) {
            return subTotal
                    .multiply(pct)
                    .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        }
        return fxd.setScale(2, RoundingMode.HALF_UP);
    }
}
