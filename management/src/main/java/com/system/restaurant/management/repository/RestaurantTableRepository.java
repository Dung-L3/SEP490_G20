package com.system.restaurant.management.repository;

import com.system.restaurant.management.entity.RestaurantTable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RestaurantTableRepository extends JpaRepository<RestaurantTable, Integer> {

    List<RestaurantTable> findByStatus(String status);

    @Query("SELECT rt FROM RestaurantTable rt WHERE rt.areaId = :areaId")
    List<RestaurantTable> findByAreaId(@Param("areaId") Integer areaId);

    @Query("SELECT rt FROM RestaurantTable rt WHERE rt.areaId = :areaId AND rt.status = 'AVAILABLE'")
    List<RestaurantTable> findFreeTablesByArea(@Param("areaId") Integer areaId);

    Optional<RestaurantTable> findByTableName(String tableName);

    List<RestaurantTable> findByTableType(String tableType);

    @Query("SELECT t FROM RestaurantTable t WHERE t.isWindow = true")
    List<RestaurantTable> findWindowTables();

    @Query("SELECT t FROM RestaurantTable t WHERE t.isWindow = true AND t.status = 'AVAILABLE'")
    List<RestaurantTable> getFreeWindowTables();

    @Query("SELECT t FROM RestaurantTable t WHERE t.status = 'RESERVED' " +
            "AND (SELECT COUNT(r) FROM Reservation r " +
            "WHERE r.tableId = t.tableId " +
            "AND r.reservationAt BETWEEN :startTime AND :endTime " +
            "AND r.statusId IN (1, 2)) < " + // PENDING or CONFIRMED
            "(SELECT COUNT(rt) FROM RestaurantTable rt) / 3")
    List<RestaurantTable> findAvailableReservedTables(
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);

}