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
    private final OrderRepository orderRepo;
    private final InvoiceRepository invoiceRepo;
    private final PaymentRecordRepository paymentRepo;
    private final ReservationRepository reservationRepo;
    private final NotificationRepository notificationRepo;
    private final UserRepository userRepo;
    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final DishRepository dishRepo;
    private final ComboRepository comboRepo;

    @PersistenceContext
    private EntityManager em;

    @Override
    @Transactional
    public TakeawayOrderResponse createTakeawayOrder(CreateTakeawayOrderRequest req) {

        Order order = new Order();
        order.setOrderType("TAKEAWAY");
        order.setCustomerName(req.getCustomerName());
        order.setPhone(req.getPhone());
        order.setNotes(req.getNotes());
        order.setCreatedAt(LocalDateTime.now());
        order.setTable(null);

        order.setStatusId(1);                         // PENDING
        order.setIsRefunded(0);                       // vì cột kiểu Integer
        order.setSubTotal(BigDecimal.ZERO);
        order.setDiscountAmount(BigDecimal.ZERO);
        order.setFinalTotal(BigDecimal.ZERO);

        order = orderRepo.save(order);                // lưu lần 1 để có orderId

        BigDecimal subTotal = BigDecimal.ZERO;

        for (var it : req.getItems()) {
            BigDecimal unitPrice;
            if (it.getDishId() != null) {
                Dish d = dishRepo.findById(it.getDishId())
                        .orElseThrow(() -> new IllegalArgumentException("Dish not found: " + it.getDishId()));
                unitPrice = d.getPrice();
            } else {
                Combo c = comboRepo.findById(it.getComboId())
                        .orElseThrow(() -> new IllegalArgumentException("Combo not found: " + it.getComboId()));
                unitPrice = c.getPrice();
            }

            OrderDetail od = new OrderDetail();
            od.setOrder(order);
            od.setDishId(it.getDishId());
            od.setComboId(it.getComboId());
            od.setQuantity(it.getQuantity());
            od.setUnitPrice(unitPrice);               // dùng giá từ DB
            od.setNotes(it.getNotes());
            od.setStatusId(1);                        // PENDING
            orderDetailRepository.save(od);

            subTotal = subTotal.add(unitPrice.multiply(BigDecimal.valueOf(it.getQuantity())));
        }

        order.setSubTotal(subTotal);
        order.setFinalTotal(subTotal.subtract(
                order.getDiscountAmount() == null ? BigDecimal.ZERO : order.getDiscountAmount()
        ));
        orderRepo.save(order);                        // cập nhật lần 2

        // build DTO trả về cho FE
        var items = orderDetailRepository.findByOrderId(order.getOrderId())
                .stream()
                .map(OrderDetailDTO::fromEntity)
                .toList();

        return TakeawayOrderResponse.builder()
                .orderId(order.getOrderId())
                .customerName(order.getCustomerName())
                .phone(order.getPhone())
                .notes(order.getNotes())
                .items(items)
                .subTotal(order.getSubTotal())
                .finalTotal(order.getFinalTotal())
                .build();
    }


    @Override
    @Transactional(readOnly = true)
    public List<TakeawayOrderResponse> getPendingTakeawayOrders() {
        // Lấy các đơn TAKEAWAY đang statusId = 1 (PENDING)
        List<Order> orders = orderRepo.findByOrderTypeAndStatusId("TAKEAWAY", 1);

        return orders.stream().map(o -> {
            // load details có dish (dùng @EntityGraph trong repo của bạn)
            List<OrderDetailDTO> details = orderDetailRepository.findByOrderId(o.getOrderId())
                    .stream()
                    .map(OrderDetailDTO::fromEntity)
                    .collect(Collectors.toList());

            return TakeawayOrderResponse.builder()
                    .orderId(o.getOrderId())
                    .customerName(o.getCustomerName())
                    .phone(o.getPhone())
                    .notes(o.getNotes())
                    .items(details)
                    .subTotal(o.getSubTotal())
                    .finalTotal(o.getFinalTotal())
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    public void confirmTakeawayOrder(Integer orderId) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Order not found: " + orderId));

        if (!"TAKEAWAY".equalsIgnoreCase(order.getOrderType())) {
            throw new IllegalStateException("Order " + orderId + " không phải TAKEAWAY");
        }
        if (order.getStatusId() != null && order.getStatusId() == 2) {
            return;
        }

        // Cập nhật trạng thái: 1 = PENDING, 2 = CONFIRMED (bạn có thể đổi theo bảng status)
        order.setStatusId(2);
        orderRepo.save(order);
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