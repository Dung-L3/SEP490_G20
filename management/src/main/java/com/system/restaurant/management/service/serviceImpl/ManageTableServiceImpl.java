package com.system.restaurant.management.service.serviceImpl;

import com.system.restaurant.management.dto.MergedTableDTO;
import com.system.restaurant.management.entity.RestaurantTable;
import com.system.restaurant.management.entity.TableGroup;
import com.system.restaurant.management.entity.TableGroupMember;
import com.system.restaurant.management.entity.TableGroupMemberId;
import com.system.restaurant.management.repository.RestaurantTableRepository;
import com.system.restaurant.management.repository.TableGroupRepository;
import com.system.restaurant.management.repository.TableGroupMemberRepository;
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
    private final TableGroupRepository tableGroupRepository;
    private final TableGroupMemberRepository tableGroupMemberRepository;
    private final OrderRepository orderRepository;

    @Override
    @Transactional
    public TableGroup mergeTable(List<Integer> tableIds, Integer createdBy, String notes) {
        // Validate input
        if (tableIds == null || tableIds.size() < 2) {
            throw new IllegalArgumentException("Cần ít nhất 2 bàn để ghép");
        }

        // Kiểm tra tất cả bàn có tồn tại và đang trống
        List<RestaurantTable> tables = tableRepository.findAllById(tableIds);
        if (tables.size() != tableIds.size()) {
            throw new IllegalArgumentException("Một hoặc nhiều bàn không tồn tại");
        }

        // Debug: Log status của từng bàn
        for (RestaurantTable table : tables) {
            System.out.println("Table ID: " + table.getTableId() + 
                             ", Name: " + table.getTableName() + 
                             ", Status: '" + table.getStatus() + "'");
        }

        // Kiểm tra bàn nào đã được ghép rồi
        List<Integer> alreadyMergedTableIds = tableGroupMemberRepository.findAll()
            .stream()
            .map(member -> member.getTable().getTableId())
            .collect(Collectors.toList());
        
        List<RestaurantTable> alreadyMergedTables = tables.stream()
            .filter(table -> alreadyMergedTableIds.contains(table.getTableId()))
            .collect(Collectors.toList());
        
        if (!alreadyMergedTables.isEmpty()) {
            String mergedTableNames = alreadyMergedTables.stream()
                .map(RestaurantTable::getTableName)
                .collect(Collectors.joining(", "));
            throw new IllegalArgumentException("Các bàn sau đã được ghép rồi: " + mergedTableNames);
        }

        // Kiểm tra bàn không thể ghép (chỉ Reserved)
        List<RestaurantTable> nonMergeableTables = tables.stream()
            .filter(table -> {
                String status = table.getStatus();
                // Chỉ cấm ghép bàn Reserved
                return status != null && status.equalsIgnoreCase("Reserved");
            })
            .collect(Collectors.toList());
        
        if (!nonMergeableTables.isEmpty()) {
            String tableNames = nonMergeableTables.stream()
                .map(RestaurantTable::getTableName)
                .collect(Collectors.joining(", "));
            throw new IllegalArgumentException("Các bàn sau không thể ghép (đã đặt trước): " + tableNames);
        }

        // Tạo TableGroup
        TableGroup tableGroup = TableGroup.builder()
            .createdBy(createdBy)
            .createdAt(LocalDateTime.now())
            .notes(notes != null ? notes : "Bàn ghép")
            .build();
        
        tableGroup = tableGroupRepository.save(tableGroup);

        // Tạo TableGroupMember records
        for (RestaurantTable table : tables) {
            TableGroupMember member = TableGroupMember.builder()
                .id(new TableGroupMemberId(tableGroup.getGroupId(), table.getTableId()))
                .tableGroup(tableGroup)
                .table(table)
                .build();
            tableGroupMemberRepository.save(member);
        }

        // Gộp orders: Link tất cả active orders với TableGroup
        System.out.println("Linking orders to table group " + tableGroup.getGroupId());
        try {
            orderRepository.updateOrdersWithTableGroupId(tableGroup.getGroupId(), tableIds);
            System.out.println("Orders successfully linked to table group");
        } catch (Exception e) {
            System.err.println("Error linking orders to table group: " + e.getMessage());
            // Continue anyway as this is not critical for table merging
        }

        return tableGroup;
    }

    @Override
    public List<RestaurantTable> getAvailableTables() {
        // Lấy tất cả bàn
        List<RestaurantTable> allTables = tableRepository.findAll();
        
        // Lấy danh sách ID các bàn đã được ghép
        List<Integer> mergedTableIds = tableGroupMemberRepository.findAll()
            .stream()
            .map(member -> member.getTable().getTableId())
            .collect(Collectors.toList());
        
        System.out.println("Merged table IDs: " + mergedTableIds);
        
        // Filter các bàn Available hoặc Occupied và không bị ghép
        return allTables.stream()
            .filter(table -> {
                String status = table.getStatus();
                boolean isAvailableOrOccupied = status != null && 
                       (status.equalsIgnoreCase("Available") || 
                        status.equalsIgnoreCase("Trống") ||
                        status.equalsIgnoreCase("Occupied") ||
                        status.equalsIgnoreCase("Đang phục vụ") ||
                        status.trim().isEmpty());
                
                boolean isNotMerged = !mergedTableIds.contains(table.getTableId());
                
                System.out.println("Table " + table.getTableId() + 
                                 " - Status: " + status + 
                                 " - Available/Occupied: " + isAvailableOrOccupied + 
                                 " - Not merged: " + isNotMerged);
                
                return isAvailableOrOccupied && isNotMerged;
            })
            .collect(Collectors.toList());
    }

    @Override
    public MergedTableDTO getMergedTableInfo(Integer groupId) {
        TableGroup tableGroup = tableGroupRepository.findById(groupId)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy nhóm bàn"));

        // Lấy tables từ TableGroupMember
        List<RestaurantTable> tables = tableGroupMemberRepository.findTablesByGroupId(groupId);
        
        // Debug logging
        System.out.println("Group ID: " + groupId + ", Tables found: " + tables.size());
        for (RestaurantTable table : tables) {
            System.out.println("Table: " + table.getTableName() + " (ID: " + table.getTableId() + ")");
        }
        
        List<String> tableNames = tables.stream()
            .map(RestaurantTable::getTableName)
            .collect(Collectors.toList());
        
        String mergedName = String.join(" + ", tableNames);
        
        System.out.println("Final merged name: " + mergedName);
        System.out.println("Table names list: " + tableNames);
        
        return new MergedTableDTO(
            tableGroup.getGroupId(),
            mergedName,
            tableNames,
            tables.stream().map(RestaurantTable::getTableId).collect(Collectors.toList()),
            "MERGED", // Custom status for merged tables
            tableGroup.getCreatedBy(),
            tableGroup.getCreatedAt(),
            tableGroup.getNotes()
        );
    }

    @Override
    public List<MergedTableDTO> getAllMergedTables() {
        List<TableGroup> allGroups = tableGroupRepository.findAll();
        return allGroups.stream()
            .map(group -> getMergedTableInfo(group.getGroupId()))
            .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void disbandTableGroup(Integer groupId) {
        System.out.println("Disbanding table group: " + groupId);
        
        // Lấy thông tin tables trong group trước khi xóa
        List<RestaurantTable> tablesInGroup = tableGroupMemberRepository.findTablesByGroupId(groupId);
        
        if (!tablesInGroup.isEmpty()) {
            // Chọn bàn chính (bàn đầu tiên) để chuyển tất cả orders về
            RestaurantTable primaryTable = tablesInGroup.get(0);
            System.out.println("Primary table selected: " + primaryTable.getTableName() + " (ID: " + primaryTable.getTableId() + ")");
            
            // Chuyển tất cả orders về bàn chính và xóa tableGroupId
            try {
                orderRepository.updateOrdersFromGroupToTable(groupId, primaryTable.getTableId());
                System.out.println("Orders transferred to primary table successfully");
            } catch (Exception e) {
                System.err.println("Error transferring orders: " + e.getMessage());
            }
        }
        
        // Xóa TableGroupMember records trước
        tableGroupMemberRepository.deleteByTableGroupId(groupId);
        
        // Xóa TableGroup
        tableGroupRepository.deleteById(groupId);
        
        System.out.println("Table group disbanded successfully");
    }

    @Override
    public List<RestaurantTable> getTablesInGroup(Integer groupId) {
        return tableGroupMemberRepository.findTablesByGroupId(groupId);
    }

    @Override
    public List<Object> getTablesForOrder() {
        List<Object> result = new ArrayList<>();
        
        // Thêm merged tables
        List<MergedTableDTO> mergedTables = getAllMergedTables();
        result.addAll(mergedTables);
        
        // Thêm individual tables (không bị merge)
        List<RestaurantTable> individualTables = tableRepository.findTablesNotInGroup();
        result.addAll(individualTables);
        
        return result;
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
        existing.setTableType(table.getTableType());
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

    @Override
    public List<String> getAllTableTypes() {
        return tableRepository.findAll().stream()
            .map(RestaurantTable::getTableType)
            .distinct()
            .collect(Collectors.toList());
    }

    @Override
    public List<RestaurantTable> getByTableType(String tableType) {
        return tableRepository.findByTableType(tableType);
    }

    // Table group operations
    @Override
    public TableGroup splitTable(List<Integer> tableIds, Integer createdBy, String notes) {
        return mergeTable(tableIds, createdBy, notes); // Same logic for now
    }

    @Override
    public TableGroup createTableGroup(List<Integer> tableIds, Integer createdBy, String notes) {
        return mergeTable(tableIds, createdBy, notes);
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