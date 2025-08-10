package com.system.restaurant.management.controller;

import com.system.restaurant.management.dto.CreateReservationRequest;
import com.system.restaurant.management.entity.Reservation;
import com.system.restaurant.management.service.ManageTableService;
import com.system.restaurant.management.service.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reservations")
@RequiredArgsConstructor
public class ReservationController {
    private final ReservationService reservationService;
    private final ManageTableService manageTableService;


    @PostMapping
    public ResponseEntity<Reservation> createReservation(@Valid @RequestBody CreateReservationRequest request) {
        // Check table availability first
        if (!manageTableService.hasAvailableReservedTables(request.getReservationAt())) {
            return ResponseEntity.badRequest().build();
        }

        Reservation newReservation = reservationService.createReservation(request);
        return new ResponseEntity<>(newReservation, HttpStatus.CREATED);
    }

    @GetMapping("/phone/{phone}")
    public ResponseEntity<List<Reservation>> getReservationsByPhone(@PathVariable String phone) {
        List<Reservation> reservations = reservationService.getReservationsByPhone(phone);
        return ResponseEntity.ok(reservations);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Reservation>> getReservationsByStatus(
            @PathVariable String status
    ) {
        List<Reservation> reservations = reservationService.getReservationsByStatus(status);
        return ResponseEntity.ok(reservations);
    }

    @PatchMapping("/{reservationId}/status")
    public ResponseEntity<Reservation> updateReservationStatus(
            @PathVariable Integer reservationId,
            @RequestParam String status
    ) {
        Reservation updatedReservation = reservationService.updateReservationStatus(reservationId, status);
        return ResponseEntity.ok(updatedReservation);
    }

    @GetMapping("/today")
    public ResponseEntity<List<Reservation>> getTodayReservations() {
        List<Reservation> reservations = reservationService.getTodayReservations();
        return ResponseEntity.ok(reservations);
    }

    @PatchMapping("/{reservationId}/confirm")
    public ResponseEntity<Reservation> confirmReservation(
            @PathVariable Integer reservationId, @RequestParam Integer tableId) {
        // Assign actual table
        manageTableService.assignTableForConfirmation(reservationId, tableId);
        // Update reservation status
        Reservation updatedReservation = reservationService.updateReservationStatus(
                reservationId, "CONFIRMED");
        return ResponseEntity.ok(updatedReservation);
    }
}