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

    // Tìm theo status
    List<RestaurantTable> findByStatus(String status);

    // Tìm theo area
    List<RestaurantTable> findByAreaId(Integer areaId);

    // Tìm theo table type
    List<RestaurantTable> findByTableType(String tableType);

    // Tìm theo table name
    Optional<RestaurantTable> findByTableName(String tableName);

    // Tìm bàn cửa sổ
    List<RestaurantTable> findByIsWindow(Boolean isWindow);

    // Tìm theo area và status
    List<RestaurantTable> findByAreaIdAndStatus(Integer areaId, String status);

    // Tìm theo table type và status
    List<RestaurantTable> findByTableTypeAndStatus(String tableType, String status);

    // Tìm bàn cửa sổ theo status
    List<RestaurantTable> findByIsWindowAndStatus(Boolean isWindow, String status);

    // Query tìm bàn trống trong area cụ thể
    @Query("SELECT t FROM RestaurantTable t WHERE t.areaId = :areaId AND t.status = 'FREE'")
    List<RestaurantTable> findFreeTablesByArea(@Param("areaId") Integer areaId);

    // Query tìm bàn cửa sổ trống
    @Query("SELECT t FROM RestaurantTable t WHERE t.isWindow = true AND t.status = 'FREE'")
    List<RestaurantTable> findFreeWindowTables();

    // Query tìm bàn theo type và area
    @Query("SELECT t FROM RestaurantTable t WHERE t.tableType = :tableType AND t.areaId = :areaId")
    List<RestaurantTable> findByTableTypeAndArea(@Param("tableType") String tableType, @Param("areaId") Integer areaId);
}