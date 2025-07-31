package com.system.restaurant.management.controller;

import com.system.restaurant.management.dto.OrderRequestDto;
import com.system.restaurant.management.dto.PaymentRequest;
import com.system.restaurant.management.dto.ReservationRequestDto;
import com.system.restaurant.management.entity.*;
import com.system.restaurant.management.repository.InvoiceRepository;
import com.system.restaurant.management.repository.OrderDetailRepository;
import com.system.restaurant.management.repository.PaymentRecordRepository;
import com.system.restaurant.management.service.InvoicePdfService;
import com.system.restaurant.management.service.ReceptionistService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpSession;
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
    private final OrderDetailRepository orderDetailRepository;
    private final PaymentRecordRepository paymentRecordRepository;
    private final InvoicePdfService invoicePdfService;
    private final InvoiceRepository invoiceRepository;


    @PostMapping("/orders/takeaway")
    public Order placeTakeawayOrder(@RequestBody OrderRequestDto request) {
        return receptionistService.placeTakeawayOrder(request);
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
    public ResponseEntity<byte[]> downloadInvoice(@PathVariable Integer orderId) throws Exception {
        Invoice inv = invoiceRepository.findByOrderId(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Invoice không tồn tại cho order " + orderId));

        List<OrderDetail> items = orderDetailRepository.findByOrderId(orderId);

        PaymentRecord pr = paymentRecordRepository
                .findTopByInvoiceIdOrderByPaidAtDesc(inv.getInvoiceId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "PaymentRecord không tồn tại cho invoice " + inv.getInvoiceId()));

        double discount = inv.getDiscountAmount().doubleValue();
        double total    = inv.getFinalTotal().doubleValue();
        String customer = inv.getOrder().getCustomerName();

        byte[] pdfBytes = invoicePdfService.generateInvoicePdf(
                orderId, customer, items, pr, discount, total);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"invoice-" + orderId + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}
