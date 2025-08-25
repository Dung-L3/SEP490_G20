package com.system.restaurant.management.controller;

import com.system.restaurant.management.dto.ApplyPromotionRequest;
import com.system.restaurant.management.dto.ApplyPromotionResponse;
import com.system.restaurant.management.dto.PromotionRequestDto;
import com.system.restaurant.management.entity.Promotion;
import com.system.restaurant.management.service.PromotionService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/promotions")
@RequiredArgsConstructor
public class PromotionController {

    private final PromotionService promotionService;

    @PostMapping("/create")
    public ResponseEntity<Promotion> create(@Valid @RequestBody PromotionRequestDto dto) {
        return ResponseEntity.ok(promotionService.create(dto));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Promotion> update(@PathVariable Integer id,
                                                       @Valid @RequestBody PromotionRequestDto dto) {
        return ResponseEntity.ok(promotionService.update(id, dto));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        promotionService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/getPromo/{id}")
    public ResponseEntity<Promotion> get(@PathVariable Integer id) {
        return ResponseEntity.ok(promotionService.get(id));
    }

    @GetMapping("/validPromotions")
    public ResponseEntity<List<Promotion>> listValidPromotions() {
        return ResponseEntity.ok(promotionService.listValidPromotions());
    }

    @GetMapping
    public ResponseEntity<Page<Promotion>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "promoId,desc") String sort) {

        String[] parts = sort.split(",");
        Sort.Direction dir = parts.length > 1 && parts[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(dir, parts[0]));
        return ResponseEntity.ok(promotionService.list(pageable));
    }

    @PostMapping("/applyPromo")
    public ResponseEntity<ApplyPromotionResponse> apply(@Valid @RequestBody ApplyPromotionRequest request) {
        return ResponseEntity.ok(promotionService.applyToOrder(request));
    }
}
