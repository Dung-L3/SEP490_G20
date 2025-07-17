package com.system.restaurant.management.service.serviceImpl;

import com.system.restaurant.management.dto.NotificationRequestDto;
import com.system.restaurant.management.entity.*;
import com.system.restaurant.management.repository.*;
import com.system.restaurant.management.service.SystemService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@Transactional
public class SystemServiceImpl implements SystemService {

    private final InvoiceRepository invoiceRepo;
    //private final CustomerPointsService pointsSvc;
    private final NotificationRepository notifyRepo;
    private final KitchenTicketRepository ticketRepo;
    private final ReservationRepository reservationRepo;
    private final OrderRepository orderRepo;

    public SystemServiceImpl(InvoiceRepository invoiceRepo,
                             //CustomerPointsService pointsSvc,
                             NotificationRepository notifyRepo,
                             KitchenTicketRepository ticketRepo,
                             ReservationRepository reservationRepo,
                             OrderRepository orderRepo) {
        this.invoiceRepo = invoiceRepo;
        //this.pointsSvc   = pointsSvc;
        this.notifyRepo  = notifyRepo;
        this.ticketRepo  = ticketRepo;
        this.reservationRepo = reservationRepo;
        this.orderRepo = orderRepo;
    }

    public Invoice generateInvoice(Long orderId) {
        Order order = new Order();
        order.setOrderId(orderId.intValue());

        Invoice inv = Invoice.builder()
                .order(order)
                .subTotal(BigDecimal.valueOf(0.0))
                .discountAmount(BigDecimal.valueOf(0.0))
                .finalTotal(BigDecimal.valueOf(0.0))
                .issuedBy(null)
                .issuedAt(LocalDateTime.now())
                .build();

        inv = invoiceRepo.save(inv);

        // nếu có tính điểm khách
        //pointsSvc.addPoints(order.getOrderId(), inv.getFinalTotal());

        return inv;
    }

    @Override
    public Notification sendNotification(NotificationRequestDto dto) {
        Notification notification = Notification.builder()
                .reservationId(dto.getRecipientId())
                .sentAt(LocalDateTime.now())
                .channel(dto.getChannel())
                .status("PENDING")
                .notes(dto.getMessage())
                .build();

        return notifyRepo.save(notification);
    }


    @Override
    public KitchenTicket triggerKitchenTicket(Long orderId) {
        KitchenTicket kt = KitchenTicket.builder()
                .orderId(orderId.intValue())
                .printedAt(LocalDateTime.now())
                .printedBy(null)
                .build();
        return ticketRepo.save(kt);
    }

    @Override
    public void lockReservationEdit(Long reservationId) {
        Reservation reservation = reservationRepo.findById(reservationId.intValue())
                .orElseThrow(() -> new EntityNotFoundException("Reservation not found"));

        reservation.setIsLocked(true);
        reservationRepo.save(reservation);
    }

    @Override
    public void lockOrderEdit(Long orderId) {
        Order order = orderRepo.findById(orderId.intValue())
                .orElseThrow(() -> new EntityNotFoundException("Order not found"));

        order.setIsLocked(true);
        orderRepo.save(order);
    }
}