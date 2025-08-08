package com.system.restaurant.management.repository;

import com.system.restaurant.management.entity.RestaurantTable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ManageTableRepository extends JpaRepository<RestaurantTable, Integer> {

//    @Query("SELECT DISTINCT t.tableType FROM RestaurantTable t WHERE t.tableType IS NOT NULL")
//    List<String> findDistinctTableTypes();

    //List<RestaurantTable> findByTableType(String tableType);
    List<RestaurantTable> findByStatus(String status);
    List<RestaurantTable> findByAreaId(Integer areaId);
}
