package com.system.restaurant.management.controller;

import com.system.restaurant.management.dto.ComboDTO;
import com.system.restaurant.management.dto.CreateDineInOrderRequest;
import com.system.restaurant.management.entity.Category;
import com.system.restaurant.management.entity.Dish;
import com.system.restaurant.management.entity.Order;
import com.system.restaurant.management.entity.RestaurantTable;
import com.system.restaurant.management.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PublicController {

    private final TableService tableService;
    private final DishService dishService;
    private final CategoryService categoryService;
    private final ComboService comboService;
    private final ReceptionistService receptionistService;

    // Table endpoints
    @GetMapping("/tables")
    public ResponseEntity<List<RestaurantTable>> getAllTables() {
        return ResponseEntity.ok(tableService.findAll());
    }

    @GetMapping("/tables/{tableId}")
    public ResponseEntity<RestaurantTable> getTableById(@PathVariable Integer tableId) {
        return ResponseEntity.ok(tableService.getById(tableId));
    }

    @GetMapping("/tables/status/{status}")
    public ResponseEntity<List<RestaurantTable>> getTablesByStatus(@PathVariable String status) {
        return ResponseEntity.ok(tableService.findByStatus(status));
    }

    @GetMapping("/tables/area/{areaId}")
    public ResponseEntity<List<RestaurantTable>> getTablesByArea(@PathVariable Integer areaId) {
        return ResponseEntity.ok(tableService.findByAreaId(areaId));
    }

    // Menu endpoints
    @GetMapping("/dishes")
    public ResponseEntity<List<Dish>> getDishes() {
        return ResponseEntity.ok(dishService.findAll());
    }

    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getCategories() {
        return ResponseEntity.ok(categoryService.findAll());
    }

    @GetMapping("/combos")
    public ResponseEntity<List<ComboDTO>> getCombos() {
        return ResponseEntity.ok(comboService.getAllCombos());
    }

    // Dine-in ordering endpoints
    @PostMapping("/orders/dine-in")
    public ResponseEntity<Order> createDineInOrder(@Valid @RequestBody CreateDineInOrderRequest request) {
        try {
            Order createdOrder = receptionistService.createDineInOrder(request);
            return ResponseEntity.ok(createdOrder);
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }
}
