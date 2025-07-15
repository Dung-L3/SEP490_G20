package com.system.restaurant.management.service.serviceImpl;

import com.system.restaurant.management.dto.CreateReservationRequest;
import com.system.restaurant.management.entity.Reservation;
import com.system.restaurant.management.exception.ResourceNotFoundException;
import com.system.restaurant.management.repository.ReservationRepository;
import com.system.restaurant.management.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class ReservationServiceImpl implements ReservationService {
    private final ReservationRepository reservationRepository;

    @Override
    public Reservation createReservation(CreateReservationRequest request) {
        Reservation reservation = Reservation.builder()
                .customerName(request.getCustomerName())
                .phone(request.getPhone())
                .email(request.getEmail()) // Có thể null
                .tableId(request.getTableId()) // Có thể null
                .reservationAt(request.getReservationAt())
                .statusId(Reservation.Status.PENDING)
                .notes(request.getNotes())
                .build();

        return reservationRepository.save(reservation);
    }

    @Override
    public List<Reservation> getReservationsByPhone(String phone) {
        return reservationRepository.findByPhone(phone);
    }

    @Override
    public List<Reservation> getReservationsByStatus(String status) {
        int statusId = Reservation.Status.getIdByName(status);
        return reservationRepository.findByStatusId(statusId);
    }

    @Override
    public Reservation updateReservationStatus(Integer reservationId, String status) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + reservationId));

        int statusId = Reservation.Status.getIdByName(status);
        reservation.setStatusId(statusId);

        return reservationRepository.save(reservation);
    }

    @Override
    public List<Reservation> getTodayReservations() {
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        return reservationRepository.findByReservationAtBetween(startOfDay, endOfDay);
    }
}