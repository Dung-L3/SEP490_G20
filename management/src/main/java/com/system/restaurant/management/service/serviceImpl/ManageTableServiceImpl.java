package com.system.restaurant.management.service.serviceImpl;

import com.system.restaurant.management.entity.RestaurantTable;
import com.system.restaurant.management.repository.RestaurantTableRepository;
import com.system.restaurant.management.repository.OrderRepository;
import com.system.restaurant.management.service.ManageTableService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ManageTableServiceImpl implements ManageTableService {
    
    private final RestaurantTableRepository tableRepository;
    private final OrderRepository orderRepository;



    @Override
    public List<RestaurantTable> getAvailableTables() {
        // Lấy tất cả bàn
        List<RestaurantTable> allTables = tableRepository.findAll();
        
        // Filter các bàn Available hoặc Occupied
        return allTables.stream()
            .filter(table -> {
                String status = table.getStatus();
                return status != null && 
                       (status.equalsIgnoreCase("Available") || 
                        status.equalsIgnoreCase("Trống") ||
                        status.equalsIgnoreCase("Occupied") ||
                        status.equalsIgnoreCase("Đang phục vụ") ||
                        status.trim().isEmpty());
            })
            .collect(Collectors.toList());
    }



    // Basic CRUD operations
    @Override
    public RestaurantTable create(RestaurantTable table) {
        return tableRepository.save(table);
    }

    @Override
    public RestaurantTable findById(Integer id) {
        return tableRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Table not found"));
    }

    @Override
    public List<RestaurantTable> findAll() {
        return tableRepository.findAll();
    }

    @Override
    public RestaurantTable update(Integer id, RestaurantTable table) {
        RestaurantTable existing = findById(id);
        existing.setTableName(table.getTableName());
        existing.setAreaId(table.getAreaId());
        existing.setStatus(table.getStatus());
        existing.setIsWindow(table.getIsWindow());
        existing.setNotes(table.getNotes());
        return tableRepository.save(existing);
    }

    @Override
    public void delete(Integer id) {
        tableRepository.deleteById(id);
    }

    @Override
    public RestaurantTable updateTableStatus(Integer tableId, String status) {
        RestaurantTable table = tableRepository.findById(tableId)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bàn với ID: " + tableId));
        
        System.out.println("Updating table " + tableId + " from '" + table.getStatus() + "' to '" + status + "'");
        
        table.setStatus(status);
        RestaurantTable savedTable = tableRepository.save(table);
        
        System.out.println("Table " + tableId + " status updated successfully");
        return savedTable;
    }

    @Override
    public List<RestaurantTable> getTablesByStatus(String status) {
        return tableRepository.findByStatus(status);
    }

    @Override
    public List<RestaurantTable> getTablesByArea(Integer areaId) {
        return tableRepository.findByAreaId(areaId);
    }



    // Reservation methods - placeholder implementations
    @Override
    public void initializeReservedTables() {
        // Implementation for reservation initialization
    }

    @Override
    public RestaurantTable assignTableForReservation(LocalDateTime reservationTime) {
        return null;
    }

    @Override
    public RestaurantTable assignTableForConfirmation(Integer reservationId) {
        return null;
    }

    @Override
    public boolean hasAvailableReservedTables(LocalDateTime reservationTime) {
        return false;
    }

    // Debug method to check table status
    public void debugTableStatus() {
        List<RestaurantTable> tables = tableRepository.findAll();
        System.out.println("=== DEBUG: Table Status Check ===");
        for (RestaurantTable table : tables) {
            System.out.println("Table ID: " + table.getTableId() + 
                             ", Name: " + table.getTableName() + 
                             ", Status: '" + table.getStatus() + "'");
        }
        System.out.println("=== END DEBUG ===");
    }
}