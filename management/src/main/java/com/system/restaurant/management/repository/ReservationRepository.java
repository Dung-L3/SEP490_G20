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

    List<Reservation> findByPhone(String phone);

    List<Reservation> findByStatus(String status);

    List<Reservation> findByTableId(Integer tableId);

    List<Reservation> findByCustomerName(String customerName);

    @Query("SELECT r FROM Reservation r WHERE r.reservationDate BETWEEN :startDate AND :endDate")
    List<Reservation> findByReservationDateBetween(@Param("startDate") LocalDateTime startDate,
                                                   @Param("endDate") LocalDateTime endDate);

    @Query("SELECT r FROM Reservation r WHERE r.phone = :phone AND r.status = :status")
    List<Reservation> findByPhoneAndStatus(@Param("phone") String phone, @Param("status") String status);

    @Query("SELECT r FROM Reservation r WHERE r.status = 'CONFIRMED' AND r.reservationDate <= :currentTime")
    List<Reservation> findActiveReservations(@Param("currentTime") LocalDateTime currentTime);

    @Query("SELECT r FROM Reservation r WHERE DATE(r.reservationDate) = CURRENT_DATE")
    List<Reservation> findTodayReservations();
}