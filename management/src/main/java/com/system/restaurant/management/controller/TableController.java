package com.system.restaurant.management.controller;

import com.system.restaurant.management.dto.TableGroupRequest;
import com.system.restaurant.management.dto.TableStatusRequest;
import com.system.restaurant.management.entity.RestaurantTable;
import com.system.restaurant.management.entity.TableGroup;
import com.system.restaurant.management.service.TableService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tables")
@RequiredArgsConstructor
public class TableController {
    private final TableService service;

    @GetMapping
    public ResponseEntity<List<RestaurantTable>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RestaurantTable> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<RestaurantTable> create(@RequestBody RestaurantTable table) {
        return ResponseEntity.ok(service.create(table));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RestaurantTable> update(@PathVariable Integer id,
                                                  @RequestBody RestaurantTable table) {
        return ResponseEntity.ok(service.update(id, table));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    // Additional table management endpoints
    @PutMapping("/{id}/status")
    public ResponseEntity<RestaurantTable> updateTableStatus(@PathVariable Integer id,
                                                             @RequestBody TableStatusRequest request) {
        RestaurantTable updatedTable = service.updateTableStatus(id, request.getStatus());
        return ResponseEntity.ok(updatedTable);
    }

    @GetMapping("/available")
    public ResponseEntity<List<RestaurantTable>> getAvailableTables() {
        List<RestaurantTable> tables = service.getAvailableTables();
        return ResponseEntity.ok(tables);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<RestaurantTable>> getTablesByStatus(@PathVariable String status) {
        List<RestaurantTable> tables = service.getTablesByStatus(status);
        return ResponseEntity.ok(tables);
    }

    @GetMapping("/area/{areaId}")
    public ResponseEntity<List<RestaurantTable>> getTablesByArea(@PathVariable Integer areaId) {
        List<RestaurantTable> tables = service.getTablesByArea(areaId);
        return ResponseEntity.ok(tables);
    }

    @PostMapping("/split")
    public ResponseEntity<TableGroup> splitTable(@RequestBody TableGroupRequest request) {
        TableGroup tableGroup = service.splitTable(request.getTableIds(), request.getCreatedBy(), request.getNotes());
        return ResponseEntity.status(HttpStatus.CREATED).body(tableGroup);
    }

    @PostMapping("/merge")
    public ResponseEntity<TableGroup> mergeTable(@RequestBody TableGroupRequest request) {
        TableGroup tableGroup = service.mergeTable(request.getTableIds(), request.getCreatedBy(), request.getNotes());
        return ResponseEntity.status(HttpStatus.CREATED).body(tableGroup);
    }

    @PostMapping("/group")
    public ResponseEntity<TableGroup> createTableGroup(@RequestBody TableGroupRequest request) {
        TableGroup tableGroup = service.createTableGroup(request.getTableIds(), request.getCreatedBy(), request.getNotes());
        return ResponseEntity.status(HttpStatus.CREATED).body(tableGroup);
    }

    @DeleteMapping("/group/{groupId}")
    public ResponseEntity<Void> disbandTableGroup(@PathVariable Integer groupId) {
        service.disbandTableGroup(groupId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/group/{groupId}/tables")
    public ResponseEntity<List<RestaurantTable>> getTablesInGroup(@PathVariable Integer groupId) {
        List<RestaurantTable> tables = service.getTablesInGroup(groupId);
        return ResponseEntity.ok(tables);
    }
}