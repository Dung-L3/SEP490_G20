package com.system.restaurant.management.repository;

import com.system.restaurant.management.entity.Promotion;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Integer> {

    Optional<Promotion> findByPromoCodeIgnoreCase(String promoCode);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Promotion p where lower(p.promoCode) = lower(:code)")
    Optional<Promotion> lockByPromoCode(@Param("code") String code);
}
