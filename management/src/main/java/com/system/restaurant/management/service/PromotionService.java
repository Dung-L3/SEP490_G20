package com.system.restaurant.management.service;

import com.system.restaurant.management.dto.ApplyPromotionRequest;
import com.system.restaurant.management.dto.ApplyPromotionResponse;
import com.system.restaurant.management.dto.PromotionRequestDto;
import com.system.restaurant.management.entity.PromoUsage;
import com.system.restaurant.management.entity.Promotion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface PromotionService {
    Promotion create(PromotionRequestDto dto);
    Promotion update(Integer promoId, PromotionRequestDto dto);
    void delete(Integer promoId);
    Promotion get(Integer promoId);
    Page<Promotion> list(Pageable pageable);
    List<Promotion> listValidPromotions();

    ApplyPromotionResponse applyToOrder(ApplyPromotionRequest request);
}
