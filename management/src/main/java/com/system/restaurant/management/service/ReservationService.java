package com.system.restaurant.management.service;

import com.system.restaurant.management.dto.CreateReservationRequest;
import com.system.restaurant.management.entity.Reservation;
import java.util.List;

public interface ReservationService {
    Reservation createReservation(CreateReservationRequest request);
    List<Reservation> getReservationsByPhone(String phone);
    List<Reservation> getReservationsByStatus(String status);
    Reservation updateReservationStatus(Integer reservationId, String status);
    List<Reservation> getTodayReservations();
}