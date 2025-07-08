package com.system.restaurant.management.repository;

import com.system.restaurant.management.entity.Dish;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DishRepository extends JpaRepository<Dish, Integer> {

    @Query("SELECT d FROM Dish d WHERE d.status = :status")
    List<Dish> findByStatus(@Param("status") Boolean status);

    @Query("SELECT d FROM Dish d WHERE d.categoryId = :categoryId")
    List<Dish> findByCategoryId(@Param("categoryId") Integer categoryId);

    @Query("SELECT d FROM Dish d WHERE d.categoryId = :categoryId AND d.status = true")
    List<Dish> findByCategoryIdAndActive(@Param("categoryId") Integer categoryId);

    @Query("SELECT d FROM Dish d WHERE d.dishName LIKE %:name% AND d.status = true")
    List<Dish> findByDishNameContainingAndActive(@Param("name") String name);

    @Query("SELECT d FROM Dish d WHERE d.status = true ORDER BY d.dishName")
    List<Dish> findActiveDishes();
}