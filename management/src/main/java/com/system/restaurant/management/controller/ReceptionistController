package com.system.restaurant.management.controller;

import com.system.restaurant.management.dto.*;
import com.system.restaurant.management.entity.*;
import com.system.restaurant.management.service.ReceptionistService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/receptionist")
@RequiredArgsConstructor
public class ReceptionistController {

    private final ReceptionistService receptionistService;

    @PostMapping("/orders/takeaway")
    public Order placeTakeawayOrder(@RequestBody OrderRequestDto request) {
        return receptionistService.placeTakeawayOrder(request);
    }

    @PostMapping("/invoices/{orderId}")
    public Invoice generateInvoice(@PathVariable Integer orderId) {
        return receptionistService.generateInvoice(orderId);
    }

    @PostMapping("/invoices/{orderId}/discount")
    public Invoice applyDiscount(@PathVariable Integer orderId, @RequestParam double amount) {
        return receptionistService.applyDiscount(orderId, amount);
    }

    @PostMapping("/invoices/{orderId}/payment")
    public PaymentRecord processPayment(@PathVariable Integer orderId, @RequestBody PaymentRequestDto req) {
        return receptionistService.processPayment(orderId, req);
    }

    @GetMapping("/invoices/{invoiceId}/export")
    public byte[] exportInvoicePdf(@PathVariable Integer invoiceId) {
        return receptionistService.exportInvoicePdf(invoiceId);
    }

    @PostMapping("/reservations")
    public Reservation createReservation(@RequestBody ReservationRequestDto dto) {
        return receptionistService.createReservation(dto);
    }

    @PutMapping("/reservations/{id}/confirm")
    public void confirmReservation(@PathVariable Integer id) {
        receptionistService.confirmReservation(id);
    }

    @PutMapping("/reservations/{id}/cancel")
    public void cancelReservation(@PathVariable Integer id) {
        receptionistService.cancelReservation(id);
    }

    @GetMapping("/reservations")
    public List<Reservation> viewCalendar() {
        return receptionistService.viewReservationCalendar();
    }

    @PostMapping("/reservations/{id}/reminder")
    public Notification sendReminder(@PathVariable Integer id) {
        return receptionistService.sendReservationReminder(id);
    }
}
