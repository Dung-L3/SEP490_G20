package com.system.restaurant.management.service;

import com.system.restaurant.management.dto.*;

import java.util.List;

public interface ComboService {
    List<ComboDTO> getAllCombos();
    ComboDTO getComboById(Integer comboId);
    ComboDTO createCombo(CreateComboRequest request);
    ComboDTO updateCombo(Integer comboId, UpdateComboRequest request);
    void deleteCombo(Integer comboId);
    List<ComboDTO> searchCombosByName(String name);
}