package com.system.restaurant.management.service.serviceImpl;

import com.system.restaurant.management.entity.Dish;
import com.system.restaurant.management.exception.ResourceNotFoundException;
import com.system.restaurant.management.repository.DishRepository;
import com.system.restaurant.management.service.DishService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DishServiceImpl implements DishService {
    private final DishRepository dishRepository;

    @Override
    public Dish create(Dish dish) {
        dish.setCreatedAt(LocalDateTime.now());
        return dishRepository.save(dish);
    }

    @Override
    public Dish findById(Integer id) {
        return dishRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Dish", "id", id));
    }

    @Override
    public List<Dish> findAll() {
        return dishRepository.findAll();
    }

    @Override
    public Dish update(Integer id, Dish dish) {
        Dish existingDish = findById(id);
        existingDish.setDishName(dish.getDishName());
        existingDish.setCategoryId(dish.getCategoryId());
        existingDish.setPrice(dish.getPrice());
        existingDish.setStatus(dish.getStatus());
        existingDish.setUnit(dish.getUnit());
        existingDish.setImageUrl(dish.getImageUrl());
        return dishRepository.save(existingDish);
    }

    @Override
    public void delete(Integer id) {
        Dish dish = findById(id);
        dishRepository.delete(dish);
    }

    @Override
    public List<Dish> findByCategoryId(Integer categoryId) {
        return dishRepository.findByCategoryId(categoryId);
    }

    @Override
    public List<Dish> findByStatus(Boolean status) {
        return dishRepository.findByStatus(status);
    }

    @Override
    public List<Dish> findByDishName(String dishName) {
        return dishRepository.findByDishNameContainingIgnoreCase(dishName);
    }
}