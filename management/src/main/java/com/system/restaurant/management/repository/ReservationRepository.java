package com.system.restaurant.management.repository;

import com.system.restaurant.management.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Integer> {
    List<Reservation> findByPhone(String phone);
    List<Reservation> findByStatusId(Integer statusId);
    List<Reservation> findByReservationAtBetween(LocalDateTime start, LocalDateTime end);
}