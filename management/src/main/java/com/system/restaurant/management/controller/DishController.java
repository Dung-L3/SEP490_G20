package com.system.restaurant.management.controller;

import com.system.restaurant.management.entity.Dish;
import com.system.restaurant.management.service.DishService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/dishes", "/api/v1/dishes"}) // Support both endpoints
@RequiredArgsConstructor
public class DishController {
    private final DishService dishService;

    /**
     * Lấy tất cả món ăn
     * GET /api/dishes
     */
    @GetMapping
    public ResponseEntity<List<Dish>> getAllDishes() {
        List<Dish> dishes = dishService.findAll();
        return ResponseEntity.ok(dishes);
    }

    /**
     * Lấy món ăn theo ID
     * GET /api/dishes/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Dish> getDishById(@PathVariable Integer id) {
        Dish dish = dishService.findById(id);
        return ResponseEntity.ok(dish);
    }

    /**
     * Tạo mới món ăn
     * POST /api/dishes
     */
    @PostMapping
    public ResponseEntity<Dish> createDish(@RequestBody Dish dish) {
        Dish createdDish = dishService.create(dish);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdDish);
    }

    /**
     * Cập nhật món ăn
     * PUT /api/dishes/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<Dish> updateDish(@PathVariable Integer id, 
                                          @RequestBody Dish dish) {
        Dish updatedDish = dishService.update(id, dish);
        return ResponseEntity.ok(updatedDish);
    }

    /**
     * Xóa món ăn
     * DELETE /api/dishes/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDish(@PathVariable Integer id) {
        dishService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Lấy món ăn theo danh mục
     * GET /api/dishes/category/{categoryId}
     */
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<Dish>> getDishesByCategory(@PathVariable Integer categoryId) {
        List<Dish> dishes = dishService.findByCategoryId(categoryId);
        return ResponseEntity.ok(dishes);
    }

    /**
     * Lấy món ăn theo trạng thái (active/inactive)
     * GET /api/dishes/status/{status}
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Dish>> getDishesByStatus(@PathVariable Boolean status) {
        List<Dish> dishes = dishService.findByStatus(status);
        return ResponseEntity.ok(dishes);
    }

    /**
     * Lấy món ăn đang hoạt động
     * GET /api/dishes/active
     */
    @GetMapping("/active")
    public ResponseEntity<List<Dish>> getActiveDishes() {
        List<Dish> dishes = dishService.findByStatus(true);
        return ResponseEntity.ok(dishes);
    }

    /**
     * Lấy món ăn không hoạt động
     * GET /api/dishes/inactive
     */
    @GetMapping("/inactive")
    public ResponseEntity<List<Dish>> getInactiveDishes() {
        List<Dish> dishes = dishService.findByStatus(false);
        return ResponseEntity.ok(dishes);
    }

    /**
     * Tìm kiếm món ăn theo tên
     * GET /api/dishes/search?name={dishName}
     */
    @GetMapping("/search")
    public ResponseEntity<List<Dish>> searchDishesByName(@RequestParam String name) {
        List<Dish> dishes = dishService.findByDishName(name);
        return ResponseEntity.ok(dishes);
    }

    /**
     * Cập nhật trạng thái món ăn
     * PATCH /api/dishes/{id}/status
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<Dish> updateDishStatus(@PathVariable Integer id,
                                                @RequestParam Boolean status) {
        Dish dish = dishService.findById(id);
        dish.setStatus(status);
        Dish updatedDish = dishService.update(id, dish);
        return ResponseEntity.ok(updatedDish);
    }

    /**
     * Kích hoạt món ăn
     * PATCH /api/dishes/{id}/activate
     */
    @PatchMapping("/{id}/activate")
    public ResponseEntity<Dish> activateDish(@PathVariable Integer id) {
        Dish dish = dishService.findById(id);
        dish.setStatus(true);
        Dish updatedDish = dishService.update(id, dish);
        return ResponseEntity.ok(updatedDish);
    }

    /**
     * Vô hiệu hóa món ăn
     * PATCH /api/dishes/{id}/deactivate
     */
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<Dish> deactivateDish(@PathVariable Integer id) {
        Dish dish = dishService.findById(id);
        dish.setStatus(false);
        Dish updatedDish = dishService.update(id, dish);
        return ResponseEntity.ok(updatedDish);
    }
}