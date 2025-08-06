package com.system.restaurant.management.service;

import com.system.restaurant.management.entity.RestaurantTable;
import com.system.restaurant.management.entity.TableGroup;
import com.system.restaurant.management.dto.MergedTableDTO;

import java.time.LocalDateTime;
import java.util.List;

public interface ManageTableService {
    RestaurantTable create(RestaurantTable table);
    RestaurantTable findById(Integer id);
    List<RestaurantTable> findAll();
    RestaurantTable update(Integer id, RestaurantTable table);
    void delete(Integer id);

    //waiter
    RestaurantTable updateTableStatus(Integer tableId, String status);
    TableGroup splitTable(List<Integer> tableIds, Integer createdBy, String notes);
    TableGroup mergeTable(List<Integer> tableIds, Integer createdBy, String notes);
    List<RestaurantTable> getAvailableTables();
    List<RestaurantTable> getTablesByStatus(String status);
    List<RestaurantTable> getTablesByArea(Integer areaId);

    // Table group management
    TableGroup createTableGroup(List<Integer> tableIds, Integer createdBy, String notes);
    void disbandTableGroup(Integer groupId);
    List<RestaurantTable> getTablesInGroup(Integer groupId);
    List<String> getAllTableTypes();
    List<RestaurantTable> getByTableType(String tableType);
    
    // Merged table info
    MergedTableDTO getMergedTableInfo(Integer groupId);
    List<MergedTableDTO> getAllMergedTables();

    //Reservation
    void initializeReservedTables();
    RestaurantTable assignTableForReservation(LocalDateTime reservationTime);
    RestaurantTable assignTableForConfirmation(Integer reservationId);
    boolean hasAvailableReservedTables(LocalDateTime reservationTime);
}


