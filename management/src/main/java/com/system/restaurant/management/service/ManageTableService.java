package com.system.restaurant.management.service;

import com.system.restaurant.management.entity.RestaurantTable;
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
    List<RestaurantTable> getAvailableTables();
    List<RestaurantTable> getTablesByStatus(String status);
    List<RestaurantTable> getTablesByArea(Integer areaId);

    //Reservation
    void initializeReservedTables();
    RestaurantTable assignTableForReservation(LocalDateTime reservationTime);
    RestaurantTable assignTableForConfirmation(Integer reservationId);
    boolean hasAvailableReservedTables(LocalDateTime reservationTime);

    // Debug method to check table status
    void debugTableStatus();
}


