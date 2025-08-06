package com.system.restaurant.management.service.serviceImpl;

import com.system.restaurant.management.dto.NotificationRequestDto;
import com.system.restaurant.management.entity.Invoice;
import com.system.restaurant.management.entity.KitchenTicket;
import com.system.restaurant.management.entity.Notification;
import com.system.restaurant.management.entity.Order;
import com.system.restaurant.management.repository.InvoiceRepository;
import com.system.restaurant.management.repository.KitchenTicketRepository;
import com.system.restaurant.management.repository.NotificationRepository;
import com.system.restaurant.management.service.SystemService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@Transactional
public class SystemServiceImpl implements SystemService {

    private final InvoiceRepository invoiceRepo;
    private final NotificationRepository notifyRepo;
    private final KitchenTicketRepository ticketRepo;

    public SystemServiceImpl(InvoiceRepository invoiceRepo,
                           NotificationRepository notifyRepo,
                           KitchenTicketRepository ticketRepo) {
        this.invoiceRepo = invoiceRepo;
        this.notifyRepo = notifyRepo;
        this.ticketRepo = ticketRepo;
    }


    public Invoice generateInvoice(Long orderId) {
        Order order = new Order();
        order.setOrderId(orderId.intValue());

        Invoice inv = Invoice.builder()
                .order(order)
                .subTotal(BigDecimal.valueOf(0.0))
                .discountAmount(BigDecimal.valueOf(0.0))
                .finalTotal(BigDecimal.valueOf(0.0))
                .issuedBy(0)
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
                .channel(dto.getChannel()) // ✅ bắt buộc có
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
        // TODO: implement khi có ReservationRepository hoặc Entity
    }

    @Override
    public void lockOrderEdit(Long orderId) {
        // TODO: implement khi có OrderRepository hoặc Entity
    }
}