package com.system.restaurant.management.repository;

import com.system.restaurant.management.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Integer> {

    @Query("SELECT r FROM Reservation r WHERE r.reservationDate >= :startOfDay AND r.reservationDate < :endOfDay")
    List<Reservation> findTodayReservations(@Param("startOfDay") LocalDateTime startOfDay,
                                            @Param("endOfDay") LocalDateTime endOfDay);

    List<Reservation> findByPhone(String phone);
    List<Reservation> findByStatus(String status);
}