package com.system.restaurant.management.repository;

import com.system.restaurant.management.entity.RestaurantTable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RestaurantTableRepository extends JpaRepository<RestaurantTable, Integer> {

    List<RestaurantTable> findByStatus(String status);

    @Query("SELECT rt FROM RestaurantTable rt WHERE rt.areaId = :areaId")
    List<RestaurantTable> findByAreaId(@Param("areaId") Integer areaId);

    @Query("SELECT rt FROM RestaurantTable rt WHERE rt.areaId = :areaId AND rt.status = 'FREE'")
    List<RestaurantTable> findFreeTablesByArea(@Param("areaId") Integer areaId);

    List<RestaurantTable> findByIsWindow(Boolean isWindow);

    @Query("SELECT rt FROM RestaurantTable rt WHERE rt.isWindow = true AND rt.status = 'FREE'")
    List<RestaurantTable> findFreeWindowTables();

    List<RestaurantTable> findByTableType(String tableType);

    Optional<RestaurantTable> findByTableName(String tableName);
}