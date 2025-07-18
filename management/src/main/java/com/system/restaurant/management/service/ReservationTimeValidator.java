package com.system.restaurant.management.service;

import java.time.LocalDateTime;
import java.time.LocalTime;

public class ReservationTimeValidator {
    private static final LocalTime OPENING_TIME = LocalTime.of(7, 30);
    private static final LocalTime LAST_RESERVATION_TIME = LocalTime.of(20, 30);
    private static final int MAX_DAYS_IN_ADVANCE = 7;

    public static void validateReservationTime(LocalDateTime reservationTime) {
        LocalDateTime now = LocalDateTime.now();
        LocalTime reservationTimeOfDay = reservationTime.toLocalTime();

        // Check if reservation is in the past
        if (reservationTime.isBefore(now)) {
            throw new IllegalArgumentException("Reservation time cannot be in the past");
        }

        // Check if reservation is within 7 days
        if (reservationTime.isAfter(now.plusDays(MAX_DAYS_IN_ADVANCE))) {
            throw new IllegalArgumentException("Reservation can only be made up to 7 days in advance");
        }

        // Check if reservation time is within operating hours
        if (reservationTimeOfDay.isBefore(OPENING_TIME) || reservationTimeOfDay.isAfter(LAST_RESERVATION_TIME)) {
            throw new IllegalArgumentException("Reservation time must be between 7:30 AM and 8:30 PM");
        }
    }
}
