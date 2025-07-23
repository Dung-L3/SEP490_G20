package com.system.restaurant.management.service.serviceImpl;

import com.system.restaurant.management.dto.OrderRequestDto;
import com.system.restaurant.management.dto.PaymentRequest;
import com.system.restaurant.management.dto.ReservationRequestDto;
import com.system.restaurant.management.entity.*;
import com.system.restaurant.management.repository.*;
import com.system.restaurant.management.service.ReceptionistService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class ReceptionistServiceImpl implements ReceptionistService {

    private final HttpSession session;
    //private final StaffRepository staffRepo;
    private final OrderRepository orderRepo;
    private final InvoiceRepository invoiceRepo;
    private final PaymentRecordRepository paymentRepo;
    private final ReservationRepository reservationRepo;
    private final NotificationRepository notificationRepo;
    private final UserRepository userRepo;

    @Override
    public Order placeTakeawayOrder(OrderRequestDto dto) {
        if (dto.getDiscountAmount() == null) {
            dto.setDiscountAmount(BigDecimal.ZERO);
        }

        Order order = Order.builder()
                .orderType(dto.getOrderType())
                .customerName(dto.getCustomerName())
                .phone(dto.getPhone())
                .subTotal(dto.getSubTotal())
                .discountAmount(dto.getDiscountAmount())
                .finalTotal(dto.getFinalTotal())
                .table(dto.getTableId() != null ? new RestaurantTable(dto.getTableId()) : null)
                .statusId(1) // Pending
                .createdAt(LocalDateTime.now())
                .isRefunded(0)
                .notes(dto.getNotes())
                .build();
        return orderRepo.save(order);
    }

    @Override
    public Invoice generateInvoice(Integer orderId, HttpSession session) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Order not found"));

        Integer userId = (Integer) session.getAttribute("userId");
        if (userId == null) {
            throw new IllegalStateException("No logged-in user found in session");
        }

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

//        Staff staff = user.getStaff();
//        if (staff == null) {
//            throw new EntityNotFoundException("Staff not associated with this user");
//        }

        Invoice invoice = Invoice.builder()
                .order(order)
                .subTotal(order.getSubTotal())
                .discountAmount(order.getDiscountAmount())
                .finalTotal(order.getFinalTotal())
                .issuedBy(user.getId())
                .issuedAt(LocalDateTime.now())
                .build();

        return invoiceRepo.save(invoice);
    }


    @Override
    public Invoice applyDiscount(Integer orderId, double amount) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Order not found"));

        order.setDiscountAmount(order.getDiscountAmount().add(BigDecimal.valueOf(amount)));
        order.setFinalTotal(order.getSubTotal().subtract(order.getDiscountAmount()));
        orderRepo.save(order);

        Invoice invoice = invoiceRepo.findByOrderId(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Invoice not found"));
        invoice.setDiscountAmount(order.getDiscountAmount());
        invoice.setFinalTotal(order.getFinalTotal());
        return invoiceRepo.save(invoice);
    }

    @Override
    public PaymentRecord processPayment(Integer orderId, PaymentRequest req) {
        Invoice invoice = invoiceRepo.findByOrderId(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Invoice not found"));

        PaymentMethod method = new PaymentMethod();
        method.setMethodId(req.getMethodId());

        PaymentRecord record = PaymentRecord.builder()
                .invoice(invoice)
                .methodId(method.getMethodId())
                .amount(req.getAmount())
                .paidAt(LocalDateTime.now())
                .notes(req.getNotes())
                .build();

        return paymentRepo.save(record);
    }

    @Override
    public byte[] exportInvoicePdf(Integer invoiceId) {
        return new byte[0];
    }

    @Override
    public Reservation createReservation(ReservationRequestDto dto) {
        User customer = userRepo.findById(dto.getCustomerId())
                .orElseThrow(() -> new EntityNotFoundException("Customer not found"));

        Reservation r = Reservation.builder()
                .customerName(dto.getCustomerName())
                .phone(dto.getPhone())
                .email(dto.getEmail())
                .reservationAt(dto.getReservationAt())
                .statusId(1) // Pending
                .createdAt(LocalDateTime.now())
                .notes(dto.getNotes())
                .build();
        return reservationRepo.save(r);
    }

    @Override
    public void confirmReservation(Integer reservationId) {
        Reservation r = reservationRepo.findById(reservationId)
                .orElseThrow(() -> new EntityNotFoundException("Reservation not found"));
        r.setStatusId(2); // Confirmed
        reservationRepo.save(r);
    }

    @Override
    public void cancelReservation(Integer reservationId) {
        Reservation r = reservationRepo.findById(reservationId)
                .orElseThrow(() -> new EntityNotFoundException("Reservation not found"));
        r.setStatusId(3); // Cancelled
        reservationRepo.save(r);
    }

    @Override
    public List<Reservation> viewReservationCalendar() {
        return reservationRepo.findAll();
    }

    @Override
    public Notification sendReservationReminder(Integer reservationId) {
        Reservation r = reservationRepo.findById(reservationId)
                .orElseThrow(() -> new EntityNotFoundException("Reservation not found"));

        Notification n = Notification.builder()
                .reservationId(r.getReservationId())
                .sentAt(LocalDateTime.now())
                .channel("Email")
                .status("Sent")
                .notes("Reminder sent")
                .build();

        return notificationRepo.save(n);
    }
}