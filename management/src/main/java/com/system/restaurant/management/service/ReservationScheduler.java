package com.system.restaurant.management.service;

import com.system.restaurant.management.entity.Reservation;
import com.system.restaurant.management.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ReservationScheduler {
    private final ReservationRepository reservationRepository;

    @Scheduled(fixedRate = 300000) // Runs every 5 minutes
    @Transactional
    public void autoCancelOverdueReservations() {
        LocalDateTime thirtyMinutesAgo = LocalDateTime.now().minusMinutes(30);

        List<Reservation> overdueReservations = reservationRepository.findByStatusIdAndReservationAtBefore(
                Reservation.Status.PENDING,
                thirtyMinutesAgo
        );

        for (Reservation reservation : overdueReservations) {
            reservation.setStatusId(Reservation.Status.CANCELLED);
        }

        reservationRepository.saveAll(overdueReservations);
    }
}