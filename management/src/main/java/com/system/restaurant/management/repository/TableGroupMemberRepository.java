package com.system.restaurant.management.repository;

import com.system.restaurant.management.entity.TableGroupMember;
import com.system.restaurant.management.entity.TableGroupMemberId;
import com.system.restaurant.management.entity.RestaurantTable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TableGroupMemberRepository extends JpaRepository<TableGroupMember, TableGroupMemberId> {
    
    // Find tables by group ID
    @Query("SELECT tgm.table FROM TableGroupMember tgm WHERE tgm.tableGroup.groupId = :groupId")
    List<RestaurantTable> findTablesByGroupId(@Param("groupId") Integer groupId);
    
    // Delete by table group ID  
    @Modifying
    @Query("DELETE FROM TableGroupMember tgm WHERE tgm.tableGroup.groupId = :groupId")
    void deleteByTableGroupId(@Param("groupId") Integer groupId);
    
    @Query("SELECT tgm FROM TableGroupMember tgm WHERE tgm.table.tableId = :tableId")
    List<TableGroupMember> findByTableId(@Param("tableId") Integer tableId);
}