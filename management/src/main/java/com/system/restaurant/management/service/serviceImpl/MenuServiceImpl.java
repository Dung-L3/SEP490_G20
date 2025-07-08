package com.system.restaurant.management.service.serviceImpl;

import com.system.restaurant.management.entity.Dish;
import com.system.restaurant.management.entity.Combo;
import com.system.restaurant.management.repository.DishRepository;
import com.system.restaurant.management.repository.ComboRepository;
import com.system.restaurant.management.service.MenuService;
import com.system.restaurant.management.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MenuServiceImpl implements MenuService {

    @Autowired
    private DishRepository dishRepository;

    @Autowired
    private ComboRepository comboRepository;

    @Override
    public List<Dish> getAllDishes() {
        return dishRepository.findActiveDishes();
    }

    @Override
    public List<Dish> getDishesByCategory(Integer categoryId) {
        return dishRepository.findByCategoryIdAndActive(categoryId);
    }

    @Override
    public List<Combo> getAllCombos() {
        return comboRepository.findAllOrderByName();
    }

    @Override
    public Dish getDishById(Integer dishId) {
        return dishRepository.findById(dishId)
                .orElseThrow(() -> new ResourceNotFoundException("Dish", "dishId", dishId));
    }

    @Override
    public Combo getComboById(Integer comboId) {
        return comboRepository.findById(comboId)
                .orElseThrow(() -> new ResourceNotFoundException("Combo", "comboId", comboId));
    }

    @Override
    public List<Dish> searchDishes(String name) {
        return dishRepository.findByDishNameContainingAndActive(name);
    }

    @Override
    public List<Combo> searchCombos(String name) {
        return comboRepository.findByComboNameContaining(name);
    }
}