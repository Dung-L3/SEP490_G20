package com.system.restaurant.management.service.serviceImpl;

import com.system.restaurant.management.dto.CreateReservationRequest;
import com.system.restaurant.management.entity.Reservation;
import com.system.restaurant.management.entity.RestaurantTable;
import com.system.restaurant.management.exception.ResourceNotFoundException;
import com.system.restaurant.management.repository.ReservationRepository;
import com.system.restaurant.management.service.ManageTableService;
import com.system.restaurant.management.service.ReservationService;
import com.system.restaurant.management.service.ReservationTimeValidator;
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
    private final ManageTableService manageTableService;

    @Override
    public Reservation createReservation(CreateReservationRequest request) {
        // Validate reservation time
        ReservationTimeValidator.validateReservationTime(request.getReservationAt());

        // Check table availability
        if (!manageTableService.hasAvailableReservedTables(request.getReservationAt())) {
            throw new IllegalStateException("No tables available for this time slot");
        }

        // Get reserved table
        RestaurantTable table = manageTableService.assignTableForReservation(request.getReservationAt());

        Reservation reservation = Reservation.builder()
                .customerName(request.getCustomerName())
                .phone(request.getPhone())
                .email(request.getEmail())
                .tableId(table.getTableId())
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