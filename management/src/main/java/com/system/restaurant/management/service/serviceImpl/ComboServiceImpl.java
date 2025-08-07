package com.system.restaurant.management.service.serviceImpl;

import com.system.restaurant.management.dto.*;
import com.system.restaurant.management.entity.*;
import com.system.restaurant.management.exception.ResourceNotFoundException;
import com.system.restaurant.management.repository.*;
import com.system.restaurant.management.service.ComboService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ComboServiceImpl implements ComboService {
    private final ComboRepository comboRepository;
    private final ComboItemRepository comboItemRepository;
    private final DishRepository dishRepository;

    @Override
    public List<ComboDTO> getAllCombos() {
        return comboRepository.findAllWithDetails()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ComboDTO getComboById(Integer comboId) {
        Combo combo = comboRepository.findByIdWithDetails(comboId)
                .orElseThrow(() -> new ResourceNotFoundException("Combo", "id", comboId));
        return convertToDTO(combo);
    }

    @Override
    public ComboDTO createCombo(CreateComboRequest request) {
        validateDishesExist(request.getComboItems());
        Combo combo = new Combo();
        combo.setComboName(request.getComboName());
        combo.setPrice(request.getPrice());
        combo.setDescription(request.getDescription());
        combo = comboRepository.save(combo);
        for (ComboItemRequest itemRequest : request.getComboItems()) {
            ComboItem comboItem = new ComboItem();
            comboItem.setComboId(combo.getComboId());
            comboItem.setDishId(itemRequest.getDishId());
            comboItem.setQuantity(itemRequest.getQuantity());
            comboItemRepository.save(comboItem);
        }
        return getComboById(combo.getComboId());
    }

    @Override
    public ComboDTO updateCombo(Integer comboId, UpdateComboRequest request) {
        Combo combo = comboRepository.findById(comboId)
                .orElseThrow(() -> new ResourceNotFoundException("Combo", "id", comboId));
        if (request.getComboName() != null) {
            combo.setComboName(request.getComboName());
        }
        if (request.getPrice() != null) {
            combo.setPrice(request.getPrice());
        }
        if (request.getDescription() != null) {
            combo.setDescription(request.getDescription());
        }
        combo = comboRepository.save(combo);
        if (request.getComboItems() != null) {
            validateDishesExist(request.getComboItems());
            comboItemRepository.deleteByComboId(comboId);
            for (ComboItemRequest itemRequest : request.getComboItems()) {
                ComboItem comboItem = ComboItem.builder()
                        .comboId(combo.getComboId())
                        .dishId(itemRequest.getDishId())
                        .quantity(itemRequest.getQuantity())
                        .build();
                comboItemRepository.save(comboItem);
            }
        }
        return getComboById(combo.getComboId());
    }

    @Override
    public void deleteCombo(Integer comboId) {
        if (!comboRepository.existsById(comboId)) {
            throw new ResourceNotFoundException("Combo", "id", comboId);
        }
        comboRepository.deleteById(comboId);
    }

    @Override
    public List<ComboDTO> searchCombosByName(String name) {
        return comboRepository.findByComboNameContainingIgnoreCase(name)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private void validateDishesExist(List<ComboItemRequest> comboItems) {
        for (ComboItemRequest item : comboItems) {
            if (!dishRepository.existsById(item.getDishId())) {
                throw new ResourceNotFoundException("Dish", "id", item.getDishId());
            }
        }
    }

    private ComboDTO convertToDTO(Combo combo) {
        ComboDTO dto = new ComboDTO();
        dto.setComboId(combo.getComboId());
        dto.setComboName(combo.getComboName());
        dto.setPrice(combo.getPrice());
        dto.setDescription(combo.getDescription());
        
        // Kiểm tra null và lấy comboItems an toàn
        List<ComboItem> items = combo.getComboItems();
        if (items != null && !items.isEmpty()) {
            List<ComboItemDTO> itemDTOs = items.stream()
                    .map(this::convertItemToDTO)
                    .collect(Collectors.toList());
            dto.setComboItems(itemDTOs);
        }
        return dto;
    }

    private ComboItemDTO convertItemToDTO(ComboItem comboItem) {
        ComboItemDTO dto = new ComboItemDTO();
        dto.setDishId(comboItem.getDishId());
        dto.setQuantity(comboItem.getQuantity());
        if (comboItem.getDish() != null) {
            dto.setDishName(comboItem.getDish().getDishName());
            dto.setUnit(comboItem.getDish().getUnit());
        }
        return dto;
    }
}
