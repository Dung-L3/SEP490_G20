package com.system.restaurant.management.repository;

import com.system.restaurant.management.entity.Reservation;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Integer> {
    List<Reservation> findByPhone(String phone);
    List<Reservation> findByReservationAtBetween(LocalDateTime start, LocalDateTime end);
    List<Reservation> findByStatusIdAndReservationAtBefore(Integer statusId, LocalDateTime dateTime);
    List<Reservation> findByStatusId(Integer statusId, Sort sort);
}