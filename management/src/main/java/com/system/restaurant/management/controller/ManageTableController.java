package com.system.restaurant.management.controller;

import com.system.restaurant.management.dto.TableGroupRequest;
import com.system.restaurant.management.dto.MergedTableDTO;
import com.system.restaurant.management.entity.RestaurantTable;
import com.system.restaurant.management.entity.TableGroup;
import com.system.restaurant.management.service.ManageTableService;
import com.system.restaurant.management.dto.request.TableStatusRequest;
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
    private final ManageTableService manageTableService;

    @GetMapping("/getAll")
    public ResponseEntity<List<RestaurantTable>> getAll() {
        return ResponseEntity.ok(manageTableService.findAll());
    }

    @GetMapping("getById/{id}")
    public ResponseEntity<RestaurantTable> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(manageTableService.findById(id));
    }

    @PostMapping("/create")
    public ResponseEntity<RestaurantTable> create(@RequestBody RestaurantTable table) {
        return ResponseEntity.ok(manageTableService.create(table));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<RestaurantTable> update(@PathVariable Integer id,
                                                  @RequestBody RestaurantTable table) {
        return ResponseEntity.ok(manageTableService.update(id, table));
    }

    @DeleteMapping("delete/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        manageTableService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("getAllTypes")
    public ResponseEntity<List<String>> getAllTypes() {
        return ResponseEntity.ok(manageTableService.getAllTableTypes());
    }

    @GetMapping("/getByTableType/{type}")
    public ResponseEntity<List<RestaurantTable>> getByType(@PathVariable String type) {
        return ResponseEntity.ok(manageTableService.getByTableType(type));
    }

    // Additional table management endpoints
    @PutMapping("/{id}/status")
    public ResponseEntity<RestaurantTable> updateTableStatus(@PathVariable Integer id,
                                                             @RequestBody TableStatusRequest request) {
        try {
            System.out.println("Updating table " + id + " to status: " + request.getStatus());
            RestaurantTable updatedTable = manageTableService.updateTableStatus(id, request.getStatus());
            return ResponseEntity.ok(updatedTable);
        } catch (Exception e) {
            System.err.println("Error updating table status: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/available")
    public ResponseEntity<List<RestaurantTable>> getAvailableTables() {
        List<RestaurantTable> tables = manageTableService.getAvailableTables();
        return ResponseEntity.ok(tables);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<RestaurantTable>> getTablesByStatus(@PathVariable String status) {
        List<RestaurantTable> tables = manageTableService.getTablesByStatus(status);
        return ResponseEntity.ok(tables);
    }

    @GetMapping("/area/{areaId}")
    public ResponseEntity<List<RestaurantTable>> getTablesByArea(@PathVariable Integer areaId) {
        List<RestaurantTable> tables = manageTableService.getTablesByArea(areaId);
        return ResponseEntity.ok(tables);
    }

    @PostMapping("/split")
    public ResponseEntity<TableGroup> splitTable(@RequestBody TableGroupRequest request) {
        TableGroup tableGroup = manageTableService.splitTable(request.getTableIds(), request.getCreatedBy(), request.getNotes());
        return ResponseEntity.status(HttpStatus.CREATED).body(tableGroup);
    }

    @PostMapping("/merge")
    public ResponseEntity<TableGroup> mergeTable(@RequestBody TableGroupRequest request) {
        TableGroup tableGroup = manageTableService.mergeTable(request.getTableIds(), request.getCreatedBy(), request.getNotes());
        return ResponseEntity.status(HttpStatus.CREATED).body(tableGroup);
    }

    @PostMapping("/group")
    public ResponseEntity<TableGroup> createTableGroup(@RequestBody TableGroupRequest request) {
        TableGroup tableGroup = manageTableService.createTableGroup(request.getTableIds(), request.getCreatedBy(), request.getNotes());
        return ResponseEntity.status(HttpStatus.CREATED).body(tableGroup);
    }

    @DeleteMapping("/group/{groupId}")
    public ResponseEntity<Void> disbandTableGroup(@PathVariable Integer groupId) {
        manageTableService.disbandTableGroup(groupId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/group/{groupId}/tables")
    public ResponseEntity<List<RestaurantTable>> getTablesInGroup(@PathVariable Integer groupId) {
        List<RestaurantTable> tables = manageTableService.getTablesInGroup(groupId);
        return ResponseEntity.ok(tables);
    }

    @GetMapping("/merged")
    public ResponseEntity<List<MergedTableDTO>> getAllMergedTables() {
        List<MergedTableDTO> mergedTables = manageTableService.getAllMergedTables();
        return ResponseEntity.ok(mergedTables);
    }

    @GetMapping("/merged/{groupId}")
    public ResponseEntity<MergedTableDTO> getMergedTableInfo(@PathVariable Integer groupId) {
        MergedTableDTO mergedTable = manageTableService.getMergedTableInfo(groupId);
        return ResponseEntity.ok(mergedTable);
    }

    @GetMapping("/for-order")
    public ResponseEntity<List<Object>> getTablesForOrder() {
        List<Object> tables = manageTableService.getTablesForOrder();
        return ResponseEntity.ok(tables);
    }
    @PostMapping("/initialize-reserved")
    public ResponseEntity<Void> initializeReservedTables() {
        manageTableService.initializeReservedTables();
        return ResponseEntity.ok().build();
    }

    @GetMapping("/check-availability")
    public ResponseEntity<Boolean> checkTableAvailability(
            @RequestParam("reservationTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime reservationTime) {
        boolean isAvailable = manageTableService.hasAvailableReservedTables(reservationTime);
        return ResponseEntity.ok(isAvailable);
    }

    @GetMapping("/assign-reservation")
    public ResponseEntity<RestaurantTable> assignTableForReservation(
            @RequestParam LocalDateTime reservationTime) {
        RestaurantTable table = manageTableService.assignTableForReservation(reservationTime);
        return ResponseEntity.ok(table);
    }

    @PostMapping("/confirm-reservation/{reservationId}")
    public ResponseEntity<RestaurantTable> confirmReservation(
            @PathVariable Integer reservationId) {
        RestaurantTable table = manageTableService.assignTableForConfirmation(reservationId);
        return ResponseEntity.ok(table);
    }

    // Test endpoint to check table status
    @GetMapping("/debug-status")
    public ResponseEntity<String> debugTableStatus() {
        try {
            manageTableService.debugTableStatus();
            return ResponseEntity.ok("Check console logs for table status debug info");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    // Quick endpoint to set some tables to different statuses for testing
    @PostMapping("/test-statuses")
    public ResponseEntity<String> setTestStatuses() {
        try {
            // Set some tables to different statuses for testing
            manageTableService.updateTableStatus(1, "Occupied");
            manageTableService.updateTableStatus(2, "Available");
            manageTableService.updateTableStatus(3, "Occupied");
            manageTableService.updateTableStatus(4, "Available");
            manageTableService.updateTableStatus(5, "Reserved");
            
            manageTableService.debugTableStatus();
            
            return ResponseEntity.ok("Test statuses set successfully. Check console logs.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }
}