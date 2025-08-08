package com.system.restaurant.management.service;

import com.system.restaurant.management.dto.OrderRequestDto;
import com.system.restaurant.management.dto.PaymentRequest;
import com.system.restaurant.management.dto.ReservationRequestDto;
import com.system.restaurant.management.entity.*;
import jakarta.servlet.http.HttpSession;

import java.util.List;

public interface ReceptionistService {
    OrderRequestDto placeTakeawayOrder(OrderRequestDto dto);
    Invoice generateInvoice(Integer orderId, HttpSession session);
    Invoice applyDiscount(Integer orderId, double amount);
    PaymentRecord processPayment(Integer orderId, PaymentRequest req);
    byte[] exportInvoicePdf(Integer invoiceId);

    Reservation createReservation(ReservationRequestDto dto);
    void confirmReservation(Integer reservationId);
    void cancelReservation(Integer reservationId);
    List<Reservation> viewReservationCalendar();
    Notification sendReservationReminder(Integer reservationId);
    List<TakeawayOrderResponse> getPendingTakeawayOrders();
    void confirmTakeawayOrder(Integer orderId);

}