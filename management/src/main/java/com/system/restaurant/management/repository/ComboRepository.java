package com.system.restaurant.management.repository;

import com.system.restaurant.management.entity.Combo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ComboRepository extends JpaRepository<Combo, Integer> {
    
    @Query("SELECT c FROM Combo c LEFT JOIN FETCH c.comboItems ci LEFT JOIN FETCH ci.dish WHERE c.comboId = :comboId")
    Optional<Combo> findByIdWithDetails(@Param("comboId") Integer comboId);
    
    @Query("SELECT c FROM Combo c LEFT JOIN FETCH c.comboItems ci LEFT JOIN FETCH ci.dish")
    List<Combo> findAllWithDetails();
    
    @Query("SELECT c FROM Combo c WHERE LOWER(c.comboName) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Combo> findByComboNameContainingIgnoreCase(@Param("name") String name);
}