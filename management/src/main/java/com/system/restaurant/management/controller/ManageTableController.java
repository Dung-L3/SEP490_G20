package com.system.restaurant.management.controller;

import com.system.restaurant.management.dto.TableGroupRequest;
import com.system.restaurant.management.dto.TableStatusRequest;
import com.system.restaurant.management.dto.MergedTableDTO;
import com.system.restaurant.management.entity.RestaurantTable;
import com.system.restaurant.management.entity.TableGroup;
import com.system.restaurant.management.service.ManageTableService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;


@RestController
@RequestMapping("/api/v1/tables")
@RequiredArgsConstructor
public class ManageTableController {
    private final ManageTableService service;

    @GetMapping("/getAll")
    public ResponseEntity<List<RestaurantTable>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("getById/{id}")
    public ResponseEntity<RestaurantTable> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping("/create")
    public ResponseEntity<RestaurantTable> create(@RequestBody RestaurantTable table) {
        return ResponseEntity.ok(service.create(table));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<RestaurantTable> update(@PathVariable Integer id,
                                                  @RequestBody RestaurantTable table) {
        return ResponseEntity.ok(service.update(id, table));
    }

    @DeleteMapping("delete/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("getAllTypes")
    public ResponseEntity<List<String>> getAllTypes() {
        return ResponseEntity.ok(service.getAllTableTypes());
    }

    @GetMapping("/getByTableType/{type}")
    public ResponseEntity<List<RestaurantTable>> getByType(@PathVariable String type) {
        return ResponseEntity.ok(service.getByTableType(type));
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

    @GetMapping("/merged")
    public ResponseEntity<List<MergedTableDTO>> getAllMergedTables() {
        List<MergedTableDTO> mergedTables = service.getAllMergedTables();
        return ResponseEntity.ok(mergedTables);
    }

    @GetMapping("/merged/{groupId}")
    public ResponseEntity<MergedTableDTO> getMergedTableInfo(@PathVariable Integer groupId) {
        MergedTableDTO mergedTable = service.getMergedTableInfo(groupId);
        return ResponseEntity.ok(mergedTable);
    }

    @GetMapping("/for-order")
    public ResponseEntity<List<Object>> getTablesForOrder() {
        List<Object> tables = service.getTablesForOrder();
        return ResponseEntity.ok(tables);
    }
    @PostMapping("/initialize-reserved")
    public ResponseEntity<Void> initializeReservedTables() {
        service.initializeReservedTables();
        return ResponseEntity.ok().build();
    }

    @GetMapping("/check-availability")
    public ResponseEntity<Boolean> checkTableAvailability(
            @RequestParam("reservationTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime reservationTime) {
        boolean isAvailable = service.hasAvailableReservedTables(reservationTime);
        return ResponseEntity.ok(isAvailable);
    }

    @GetMapping("/assign-reservation")
    public ResponseEntity<RestaurantTable> assignTableForReservation(
            @RequestParam LocalDateTime reservationTime) {
        RestaurantTable table = service.assignTableForReservation(reservationTime);
        return ResponseEntity.ok(table);
    }

    @PostMapping("/confirm-reservation/{reservationId}")
    public ResponseEntity<RestaurantTable> confirmReservation(
            @PathVariable Integer reservationId) {
        RestaurantTable table = service.assignTableForConfirmation(reservationId);
        return ResponseEntity.ok(table);
    }
}