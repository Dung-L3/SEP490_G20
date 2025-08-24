package com.system.restaurant.management.repository;

import com.system.restaurant.management.entity.ComboItem;
import com.system.restaurant.management.entity.ComboItemId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComboItemRepository extends JpaRepository<ComboItem, ComboItemId> {

    @Modifying
    @Query("DELETE FROM ComboItem ci WHERE ci.comboId = :comboId")
    void deleteByComboId(@Param("comboId") Integer comboId);

    @Query("SELECT ci FROM ComboItem ci WHERE ci.comboId = :comboId")
    List<ComboItem> findByComboId(@Param("comboId") Integer comboId);
}