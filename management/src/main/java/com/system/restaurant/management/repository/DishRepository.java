package com.system.restaurant.management.repository;

import com.system.restaurant.management.entity.Dish;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DishRepository extends JpaRepository<Dish, Integer> {
    List<Dish> findByCategoryId(Integer categoryId);
    List<Dish> findByStatus(Boolean status);
    List<Dish> findByDishNameContainingIgnoreCase(String dishName);
}