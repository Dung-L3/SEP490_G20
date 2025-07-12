package com.system.restaurant.management.service;

import com.system.restaurant.management.entity.Dish;

import java.util.List;

public interface DishService {
    Dish create(Dish dish);
    Dish findById(Integer id);
    List<Dish> findAll();
    Dish update(Integer id, Dish dish);
    void delete(Integer id);
    List<Dish> findByCategoryId(Integer categoryId);
    List<Dish> findByStatus(Boolean status);
    List<Dish> findByDishName(String dishName);
}