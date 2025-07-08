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

    @Query("SELECT r FROM Reservation r WHERE r.statusId = :statusId ORDER BY r.reservationAt")
    List<Reservation> findByStatusIdOrderByReservationAt(@Param("statusId") Integer statusId);

    @Query("SELECT r FROM Reservation r WHERE r.phone = :phone ORDER BY r.createdAt DESC")
    List<Reservation> findByPhoneOrderByCreatedAtDesc(@Param("phone") String phone);

    @Query("SELECT r FROM Reservation r WHERE r.tableId = :tableId AND r.statusId = :statusId")
    List<Reservation> findByTableIdAndStatusId(@Param("tableId") Integer tableId, @Param("statusId") Integer statusId);

    @Query("SELECT r FROM Reservation r WHERE r.reservationAt BETWEEN :startDate AND :endDate")
    List<Reservation> findByReservationAtBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}