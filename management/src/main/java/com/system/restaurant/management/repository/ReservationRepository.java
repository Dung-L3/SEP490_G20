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

    @Query("SELECT r FROM Reservation r WHERE r.reservationAt >= :startOfDay AND r.reservationAt < :endOfDay")
    List<Reservation> findTodayReservations(@Param("startOfDay") LocalDateTime startOfDay,
                                            @Param("endOfDay") LocalDateTime endOfDay);

    List<Reservation> findByPhone(String phone);

    List<Reservation> findByStatusId(Integer statusId);

    @Query("SELECT r FROM Reservation r WHERE r.tableId = :tableId AND r.statusId = :statusId")
    List<Reservation> findByTableIdAndStatusId(@Param("tableId") Integer tableId, @Param("statusId") Integer statusId);

    @Query("SELECT r FROM Reservation r WHERE r.reservationAt BETWEEN :startTime AND :endTime")
    List<Reservation> findByReservationTimeBetween(@Param("startTime") LocalDateTime startTime,
                                                   @Param("endTime") LocalDateTime endTime);

    @Query("SELECT r FROM Reservation r WHERE r.tableId = :tableId AND r.reservationAt BETWEEN :startTime AND :endTime AND r.statusId IN (1, 2)")
    List<Reservation> findActiveReservationsByTableAndTime(@Param("tableId") Integer tableId,
                                                           @Param("startTime") LocalDateTime startTime,
                                                           @Param("endTime") LocalDateTime endTime);

    @Query("SELECT r FROM Reservation r WHERE r.statusId = 1 AND r.reservationAt <= :currentTime")
    List<Reservation> findPendingReservationsBeforeTime(@Param("currentTime") LocalDateTime currentTime);
}