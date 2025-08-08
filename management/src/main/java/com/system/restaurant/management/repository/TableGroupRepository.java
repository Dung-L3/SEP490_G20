package com.system.restaurant.management.repository;

import com.system.restaurant.management.entity.TableGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TableGroupRepository extends JpaRepository<TableGroup, Integer> {
}