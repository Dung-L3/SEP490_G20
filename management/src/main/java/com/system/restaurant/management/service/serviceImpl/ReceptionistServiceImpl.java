package com.system.restaurant.management.service.serviceImpl;

import com.system.restaurant.management.dto.*;
import com.system.restaurant.management.entity.*;
import com.system.restaurant.management.repository.*;
import com.system.restaurant.management.service.ReceptionistService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.PersistenceContext;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.system.restaurant.management.dto.OrderDetailDTO;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

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
    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;

    @PersistenceContext
    private EntityManager em;

    @Override
    @Transactional
    public TakeawayOrderResponse createTakeawayOrder(CreateTakeawayOrderRequest req) {
        BigDecimal subTotal = req.getItems().stream()
                .map(i -> i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Order order = Order.builder()
                .customerName(req.getCustomerName())
                .phone(req.getPhone())
                .orderType("TAKEAWAY")
                .notes(req.getNotes())
                .subTotal(subTotal)
                .finalTotal(subTotal)
                .build();

        Order saved = orderRepo.save(order);

        req.getItems().forEach(i -> {
            OrderDetail od = new OrderDetail();
            od.setOrderId(saved.getOrderId());
            od.setDishId(i.getDishId());
            od.setQuantity(i.getQuantity());
            od.setUnitPrice(i.getUnitPrice());
            od.setNotes(i.getNotes());
            orderDetailRepository.save(od);
        });

        em.flush();
        em.clear();

        // nếu dùng @EntityGraph hoặc eager fetch, gọi bình thường
        List<OrderDetail> detailEntities = orderDetailRepository.findByOrderId(saved.getOrderId());
        // hoặc nếu dùng join fetch JPQL:
        // List<OrderDetail> detailEntities = orderDetailRepo.findByOrderIdWithDish(saved.getOrderId());

        List<OrderDetailDTO> details = orderDetailRepository
                .findByOrderId(saved.getOrderId())
                .stream()
                .map(OrderDetailDTO::fromEntity)
                .collect(Collectors.toList());

        return TakeawayOrderResponse.builder()
                .orderId(saved.getOrderId())
                .customerName(saved.getCustomerName())
                .phone(saved.getPhone())
                .notes(saved.getNotes())
                .items(details)
                .subTotal(saved.getSubTotal())
                .finalTotal(saved.getFinalTotal())
                .build();
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