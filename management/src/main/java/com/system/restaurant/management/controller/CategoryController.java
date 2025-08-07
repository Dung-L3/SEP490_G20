package com.system.restaurant.management.controller;

import com.system.restaurant.management.entity.Category;
import com.system.restaurant.management.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/categories", "/api/v1/categories"})
@RequiredArgsConstructor
public class CategoryController {
    
    private final CategoryService categoryService;

    /**
     * Lấy tất cả danh mục
     * GET /api/v1/categories/getAll
     */
    @GetMapping({"/getAll", "/"})
    public ResponseEntity<List<Category>> getAllCategories() {
        List<Category> categories = categoryService.findAll();
        return ResponseEntity.ok(categories);
    }

    /**
     * Lấy danh mục theo ID
     * GET /api/v1/categories/getById/{id}
     */
    @GetMapping({"/getById/{id}", "/{id}"})
    public ResponseEntity<Category> getCategoryById(@PathVariable Integer id) {
        Category category = categoryService.findById(id);
        return ResponseEntity.ok(category);
    }
}