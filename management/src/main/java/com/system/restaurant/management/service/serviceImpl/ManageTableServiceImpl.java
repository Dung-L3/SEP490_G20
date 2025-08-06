package com.system.restaurant.management.service.serviceImpl;

import com.system.restaurant.management.entity.RestaurantTable;
import com.system.restaurant.management.entity.TableGroup;
import com.system.restaurant.management.entity.TableGroupMember;
import com.system.restaurant.management.dto.MergedTableDTO;
import com.system.restaurant.management.exception.ResourceNotFoundException;
import com.system.restaurant.management.repository.ManageTableRepository;
import com.system.restaurant.management.repository.RestaurantTableRepository;
import com.system.restaurant.management.repository.TableGroupRepository;
import com.system.restaurant.management.repository.TableGroupMemberRepository;
import com.system.restaurant.management.service.ManageTableService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ManageTableServiceImpl implements ManageTableService {
    private final ManageTableRepository repo;
    private final TableGroupRepository tableGroupRepository;
    private final TableGroupMemberRepository tableGroupMemberRepository;
    private final RestaurantTableRepository tableRepository;

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
    public List<RestaurantTable> getByTableType(String tableType) {
        return repo.findByTableType(tableType);
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
        
        // Reset table status back to Available
        List<RestaurantTable> tables = tableGroupMemberRepository.findTablesByGroupId(groupId);
        for (RestaurantTable table : tables) {
            table.setStatus("Available");
            repo.save(table);
        }
        
        // Delete group members first (foreign key constraint)
        tableGroupMemberRepository.deleteByTableGroupGroupId(groupId);
        
        // Delete the group
        tableGroupRepository.deleteById(groupId);
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
    public RestaurantTable assignTableForConfirmation(Integer reservationId) {
        List<RestaurantTable> availableTables = tableRepository.findByStatus(RestaurantTable.Status.AVAILABLE);

        if (availableTables.isEmpty()) {
            throw new IllegalStateException("No available tables for seating customers");
        }

        RestaurantTable selectedTable = availableTables.get(0);
        selectedTable.setStatus(RestaurantTable.Status.OCCUPIED);
        return tableRepository.save(selectedTable);
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
}