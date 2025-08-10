package com.system.restaurant.management.service.serviceImpl;

import com.system.restaurant.management.entity.*;
import com.system.restaurant.management.dto.MergedTableDTO;
import com.system.restaurant.management.exception.ResourceNotFoundException;
import com.system.restaurant.management.repository.*;
import com.system.restaurant.management.service.ManageTableService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
@Transactional
public class ManageTableServiceImpl implements ManageTableService {
    private final ManageTableRepository repo;
    private final TableGroupRepository tableGroupRepository;
    private final TableGroupMemberRepository tableGroupMemberRepository;
    private final RestaurantTableRepository tableRepository;
    private final AreaRepository areaRepository;
    private final ReservationRepository reservationRepository;

    @Override
    public RestaurantTable create(RestaurantTable table) {
        table.setCreatedAt(LocalDateTime.now());
        return repo.save(table);
    }

    @Override
    @Transactional(readOnly = true)
    public RestaurantTable findById(Integer id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RestaurantTable", "id", id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<RestaurantTable> findAll() {
        return repo.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Area> findAllAreas() {
        return areaRepository.findAll();
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
        return repo.save(existing);
    }

    @Override
    public void delete(Integer id) {
        RestaurantTable existing = findById(id);
        repo.delete(existing);
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getAllTableTypes() {
        return repo.findDistinctTableTypes();
    }

    @Override
    @Transactional(readOnly = true)
    public List<RestaurantTable> getTablesAvailableByArea(Integer areaId) {
        return repo.findByAreaIdAndStatusIgnoreCase(areaId, "Available");
    }

    @Override
    public RestaurantTable updateTableStatus(Integer tableId, String status) {
        RestaurantTable table = findById(tableId);
        table.setStatus(status);
        return repo.save(table);
    }

    @Override
    public TableGroup splitTable(List<Integer> tableIds, Integer createdBy, String notes) {
        // Validate all tables exist
        for (Integer tableId : tableIds) {
            findById(tableId);
        }

        TableGroup tableGroup = TableGroup.builder()
                .createdBy(createdBy)
                .createdAt(LocalDateTime.now())
                .notes(notes != null ? notes : "Split table operation")
                .build();

        return tableGroupRepository.save(tableGroup);
    }

    @Override
    public TableGroup mergeTable(List<Integer> tableIds, Integer createdBy, String notes) {
        // Validate all tables exist and are available for merging
        for (Integer tableId : tableIds) {
            RestaurantTable table = findById(tableId);
            if (!"Available".equals(table.getStatus()) && !"Occupied".equals(table.getStatus())) {
                throw new IllegalStateException("Table " + tableId + " is not available for merging");
            }
        }

        // Create TableGroup
        TableGroup tableGroup = TableGroup.builder()
                .createdBy(createdBy)
                .createdAt(LocalDateTime.now())
                .notes(notes != null ? notes : "Merge table operation")
                .build();

        TableGroup savedGroup = tableGroupRepository.save(tableGroup);

        // Create TableGroupMembers for each table
        for (Integer tableId : tableIds) {
            TableGroupMember member = new TableGroupMember(savedGroup.getGroupId(), tableId);
            tableGroupMemberRepository.save(member);
            
            // Update table status to MERGED
            RestaurantTable table = findById(tableId);
            table.setStatus("MERGED");
            repo.save(table);
        }

        return savedGroup;
    }

    @Override
    @Transactional(readOnly = true)
    public List<RestaurantTable> getAvailableTables() {
        return repo.findByStatus("Available");
    }

    @Override
    @Transactional(readOnly = true)
    public List<RestaurantTable> getTablesByStatus(String status) {
        return repo.findByStatus(status);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RestaurantTable> getTablesByArea(Integer areaId) {
        return repo.findByAreaId(areaId);
    }

    @Override
    public TableGroup createTableGroup(List<Integer> tableIds, Integer createdBy, String notes) {
        // Validate all tables exist and are available
        for (Integer tableId : tableIds) {
            RestaurantTable table = findById(tableId);
            if (!"Available".equals(table.getStatus())) {
                throw new IllegalStateException("Table " + tableId + " is not available for grouping");
            }
        }

        TableGroup tableGroup = TableGroup.builder()
                .createdBy(createdBy)
                .createdAt(LocalDateTime.now())
                .notes(notes)
                .build();

        return tableGroupRepository.save(tableGroup);
    }

    @Override
    public void disbandTableGroup(Integer groupId) {
        if (!tableGroupRepository.existsById(groupId)) {
            throw new ResourceNotFoundException("TableGroup", "id", groupId);
        }
        
        // Get tables in group before deleting
        List<RestaurantTable> tables = tableGroupMemberRepository.findTablesByGroupId(groupId);
        
        // Reset table status back to Available for each table
        for (RestaurantTable table : tables) {
            table.setStatus("Available"); // Reset về Available
            repo.save(table);
            System.out.println("Reset table " + table.getTableName() + " status to Available");
        }
        
        // Delete group members first (foreign key constraint)
        tableGroupMemberRepository.deleteByTableGroupGroupId(groupId);
        
        // Delete the group
        tableGroupRepository.deleteById(groupId);
        
        System.out.println("Disbanded table group " + groupId + " successfully");
    }

    @Override
    @Transactional(readOnly = true)
    public List<RestaurantTable> getTablesInGroup(Integer groupId) {
        if (!tableGroupRepository.existsById(groupId)) {
            throw new ResourceNotFoundException("TableGroup", "id", groupId);
        }
        return tableGroupMemberRepository.findTablesByGroupId(groupId);
    }
    @Override
    public void initializeReservedTables() {
        // Find or create the special reserved table
        List<RestaurantTable> reservedTables = tableRepository.findByStatus(RestaurantTable.Status.RESERVED);

        if (reservedTables.isEmpty()) {
            // Create new reserved table if it doesn't exist
            RestaurantTable specialTable = RestaurantTable.builder()
                    .tableName("Auto-Reservation Table")
                    .areaId(1) // Assuming area ID 1 exists
                    .tableType("Reserved")
                    .status(RestaurantTable.Status.RESERVED)
                    .isWindow(false)
                    .notes("Special table for automatic reservations. Capacity: 1/3 of total restaurant capacity")
                    .createdAt(LocalDateTime.now())
                    .build();

            tableRepository.save(specialTable);
        }
    }

    @Override
    public RestaurantTable assignTableForReservation(LocalDateTime reservationTime) {
        LocalDateTime endTime = reservationTime.plusHours(2);
        List<RestaurantTable> availableReservedTables = tableRepository
                .findAvailableReservedTables(reservationTime, endTime);

        if (availableReservedTables.isEmpty()) {
            throw new IllegalStateException("No reserved tables available for this time slot");
        }

        return availableReservedTables.get(0);
    }

    @Override
    @Transactional
    public void assignTableForConfirmation(Integer reservationId, Integer newTableId) {
        Reservation res = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalStateException("Reservation not found: " + reservationId));

        RestaurantTable newTable = tableRepository.findById(newTableId)
                .orElseThrow(() -> new IllegalStateException("Table not found: " + newTableId));

        RestaurantTable currentTable = null;
        if (res.getTableId() != null) {
            currentTable = tableRepository.findById(res.getTableId()).orElse(null);
        }

        if (currentTable != null && !currentTable.getTableId().equals(newTableId)) {
            if (currentTable.getStatus().equals(RestaurantTable.Status.OCCUPIED)) {
                currentTable.setStatus(RestaurantTable.Status.AVAILABLE);
                tableRepository.save(currentTable);
            }
        }

        newTable.setStatus(RestaurantTable.Status.OCCUPIED);
        tableRepository.save(newTable);
        res.setTableId(newTableId);
        reservationRepository.save(res);
    }


    @Override
    public boolean hasAvailableReservedTables(LocalDateTime reservationTime) {
        LocalDateTime endTime = reservationTime.plusHours(2);
        return !tableRepository.findAvailableReservedTables(reservationTime, endTime).isEmpty();
    }

    @Override
    @Transactional(readOnly = true)
    public MergedTableDTO getMergedTableInfo(Integer groupId) {
        TableGroup tableGroup = tableGroupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("TableGroup", "id", groupId));
        
        List<RestaurantTable> tables = tableGroupMemberRepository.findTablesByGroupId(groupId);
        
        if (tables.isEmpty()) {
            throw new IllegalStateException("No tables found in group " + groupId);
        }
        
        // Build merged table name: "Bàn 1 + Bàn 2 + Bàn 3"
        List<String> tableNames = tables.stream()
                .map(RestaurantTable::getTableName)
                .sorted()
                .toList();
        
        String mergedName = String.join(" + ", tableNames);
        
        List<Integer> tableIds = tables.stream()
                .map(RestaurantTable::getTableId)
                .sorted()
                .toList();
        
        // Status sẽ là "MERGED" nếu tất cả bàn đều MERGED
        String status = tables.stream()
                .allMatch(table -> "MERGED".equals(table.getStatus())) ? "MERGED" : "MIXED";
        
        return new MergedTableDTO(
                groupId,
                mergedName,
                tableNames,
                tableIds,
                status,
                tableGroup.getCreatedBy(),
                tableGroup.getCreatedAt(),
                tableGroup.getNotes()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<MergedTableDTO> getAllMergedTables() {
        List<TableGroup> allGroups = tableGroupRepository.findAll();
        
        return allGroups.stream()
                .map(group -> {
                    try {
                        return getMergedTableInfo(group.getGroupId());
                    } catch (Exception e) {
                        // Skip groups that have issues (empty groups, etc.)
                        return null;
                    }
                })
                .filter(dto -> dto != null)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Object> getTablesForOrder() {
        List<Object> result = new ArrayList<>();
        
        // 1. Lấy tất cả bàn không bị merge
        List<RestaurantTable> individualTables = tableRepository.findTablesNotInGroup();
        result.addAll(individualTables);
        
        // 2. Lấy tất cả bàn đã merge (dưới dạng MergedTableDTO)
        List<MergedTableDTO> mergedTables = getAllMergedTables();
        result.addAll(mergedTables);
        
        return result;
    }
}