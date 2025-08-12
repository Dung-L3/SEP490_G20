package com.system.restaurant.management.controller;

import com.system.restaurant.management.dto.*;
import com.system.restaurant.management.entity.*;
import com.system.restaurant.management.repository.InvoiceRepository;
import com.system.restaurant.management.repository.OrderDetailRepository;
import com.system.restaurant.management.repository.PaymentRecordRepository;
import com.system.restaurant.management.repository.UserRepository;
import com.system.restaurant.management.service.InvoicePdfService;
import com.system.restaurant.management.service.ReceptionistService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/receptionist")
@RequiredArgsConstructor
public class ReceptionistController {

    private final ReceptionistService receptionistService;
    private final InvoicePdfService invoicePdfService;
//    @PostMapping("/orders/takeaway")
//    public ResponseEntity<TakeawayOrderResponse> createTakeawayOrder(
//            @Valid @RequestBody CreateTakeawayOrderRequest request
//    ) {
//        TakeawayOrderResponse resp = receptionistService.createTakeawayOrder(request);
//        return ResponseEntity.ok(resp);
//    }

    @GetMapping("/orders/takeaway/pending")
    public List<TakeawayOrderResponse> getPendingTakeawayOrders() {
        return receptionistService.getPendingTakeawayOrders();
    }

    // === NEW: confirm & gửi bếp (cập nhật statusId = 2)
    @PostMapping({"/orders/{orderId}/confirm-to-kitchen", "/orders/{orderId}/confirm"})
    public ResponseEntity<Void> confirmTakeawayOrder(@PathVariable Integer orderId) {
        receptionistService.confirmTakeawayOrder(orderId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/invoices/{orderId}")
    public Invoice generateInvoice(@PathVariable Integer orderId, HttpSession session) {
        return receptionistService.generateInvoice(orderId, session);
    }

    @PostMapping("/invoices/{orderId}/discount")
    public Invoice applyDiscount(@PathVariable Integer orderId, @RequestParam double amount) {
        return receptionistService.applyDiscount(orderId, amount);
    }

    @PostMapping("/orders/{orderId}/payment")
    public PaymentRecord processPayment(@PathVariable Integer orderId, @RequestBody PaymentRequest req) {
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

    @GetMapping("/{orderId}/invoice.pdf")
    public ResponseEntity<byte[]> downloadInvoice(@PathVariable Integer orderId, @SessionAttribute("userId") Integer sessionUserId) throws Exception {

        byte[] pdfBytes = invoicePdfService.buildInvoicePdf(orderId, sessionUserId);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"invoice-" + orderId + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}