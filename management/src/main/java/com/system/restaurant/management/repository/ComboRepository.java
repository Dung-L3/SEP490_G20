package com.system.restaurant.management.repository;

import com.system.restaurant.management.entity.Combo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComboRepository extends JpaRepository<Combo, Integer> {

    @Query("SELECT c FROM Combo c WHERE c.comboName LIKE %:name%")
    List<Combo> findByComboNameContaining(@Param("name") String name);

    @Query("SELECT c FROM Combo c ORDER BY c.comboName")
    List<Combo> findAllOrderByName();
}