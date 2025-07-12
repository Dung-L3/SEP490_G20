package com.system.restaurant.management.service;

import com.system.restaurant.management.entity.Dish;
import com.system.restaurant.management.entity.Combo;

import java.util.List;

public interface MenuService {
    List<Dish> getAllDishes();
    List<Dish> getDishesByCategory(Integer categoryId);
    List<Combo> getAllCombos();
    Dish getDishById(Integer dishId);
    Combo getComboById(Integer comboId);
}