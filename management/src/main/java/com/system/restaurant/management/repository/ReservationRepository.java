package com.system.restaurant.management.repository;

import com.system.restaurant.management.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Integer> {
    List<Reservation> findByReservationAtBetween(LocalDateTime from, LocalDateTime to);
}