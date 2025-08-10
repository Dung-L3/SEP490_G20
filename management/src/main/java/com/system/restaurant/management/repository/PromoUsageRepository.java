package com.system.restaurant.management.repository;

import com.system.restaurant.management.entity.PromoUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PromoUsageRepository extends JpaRepository<PromoUsage, Long> {
}
