package com.system.restaurant.management.service.serviceImpl;

import com.system.restaurant.management.dto.*;
import com.system.restaurant.management.entity.*;
import com.system.restaurant.management.repository.*;
import com.system.restaurant.management.service.WaiterService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class WaiterServiceImpl implements WaiterService {

    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final ReservationRepository reservationRepository;
    private final RestaurantTableRepository restaurantTableRepository;
    private final CustomerRepository customerRepository;
    private final DishRepository dishRepository;
    private final ComboRepository comboRepository;
    private final InvoiceRepository invoiceRepository;
    private final PaymentRecordRepository paymentRecordRepository;

    @Override
    public Order createOrderWithReservationTracking(CreateOrderRequest request) {
        String customerName = request.getCustomerName();
        String phone = request.getCustomerPhone();

        // Tracking từ reservation nếu có reservationId
        if (request.getReservationId() != null) {
            Optional<Reservation> reservation = reservationRepository.findById(request.getReservationId());
            if (reservation.isPresent()) {
                Reservation res = reservation.get();
                customerName = res.getCustomerName();
                phone = res.getPhone();

                // Cập nhật status reservation thành Confirmed
                res.setStatusId(2);
                reservationRepository.save(res);
            }
        }

        // Validation: không được để phone trống
        if (phone == null || phone.trim().isEmpty()) {
            throw new RuntimeException("Số điện thoại không được để trống");
        }

        // Tính tổng tiền
        BigDecimal subTotal = calculateSubTotal(request.getItems());
        BigDecimal discountAmount = request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO;
        BigDecimal finalTotal = subTotal.subtract(discountAmount);

        // Cập nhật trạng thái bàn nếu là DINEIN
        if ("DINEIN".equalsIgnoreCase(request.getOrderType()) && request.getTableId() != null) {
            RestaurantTable table = restaurantTableRepository.findById(request.getTableId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy bàn"));
            table.setStatus("OCCUPIED");
            restaurantTableRepository.save(table);
        }

        // Tạo order
        Order order = Order.builder()
                .orderType(request.getOrderType())
                .customerName(customerName)
                .phone(phone)
                .subTotal(subTotal)
                .discountAmount(discountAmount)
                .finalTotal(finalTotal)
                .tableId(request.getTableId())
                .statusId(1)
                .isRefunded(0)
                .notes(request.getNotes())
                .createdAt(LocalDateTime.now())
                .build();

        order = orderRepository.save(order);

        // Tạo order details
        if (request.getItems() != null) {
            for (OrderItemRequest item : request.getItems()) {
                OrderDetail orderDetail = OrderDetail.builder()
                        .orderId(order.getOrderId())
                        .dishId(item.getDishId())
                        .comboId(item.getComboId())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .statusId(1)
                        .isRefunded(0)
                        .notes(item.getNotes())
                        .build();
                orderDetailRepository.save(orderDetail);
            }
        }

        return order;
    }

    @Override
    public Order createDineInOrder(CreateDineInOrderRequest request) {
        CreateOrderRequest orderRequest = CreateOrderRequest.builder()
                .orderType("DINEIN")
                .customerName(request.getCustomerName())
                .customerPhone(request.getCustomerPhone())
                .tableId(request.getTableId())
                .reservationId(request.getReservationId())
                .notes(request.getNotes())
                .items(request.getOrderItems())
                .build();

        return createOrderWithReservationTracking(orderRequest);
    }

    @Override
    public Order createTakeawayOrder(CreateTakeawayOrderRequest request) {
        CreateOrderRequest orderRequest = CreateOrderRequest.builder()
                .orderType("TAKEAWAY")
                .customerName(request.getCustomerName())
                .customerPhone(request.getCustomerPhone())
                .notes(request.getNotes())
                .items(request.getOrderItems())
                .build();

        return createOrderWithReservationTracking(orderRequest);
    }

    @Override
    public CheckInResponse checkInReservation(Integer reservationId, Integer tableId) {
        Optional<Reservation> reservation = reservationRepository.findById(reservationId);
        if (reservation.isEmpty()) {
            throw new RuntimeException("Không tìm thấy reservation với ID: " + reservationId);
        }

        Reservation res = reservation.get();
        res.setStatusId(2); // Confirmed
        reservationRepository.save(res);

        CreateOrderRequest orderRequest = CreateOrderRequest.builder()
                .orderType("DINEIN")
                .customerName(res.getCustomerName())
                .customerPhone(res.getPhone())
                .tableId(tableId)
                .reservationId(reservationId)
                .notes("Check-in từ reservation")
                .build();

        Order order = createOrderWithReservationTracking(orderRequest);

        RestaurantTable table = restaurantTableRepository.findById(tableId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bàn với ID: " + tableId));

        return CheckInResponse.builder()
                .orderId(order.getOrderId())
                .tableId(tableId)
                .tableName(table.getTableName())
                .customerName(order.getCustomerName())
                .phone(order.getPhone())
                .orderType(order.getOrderType())
                .finalTotal(order.getFinalTotal())
                .statusId(order.getStatusId())
                .createdAt(order.getCreatedAt())
                .message("Check-in thành công")
                .build();
    }

    @Override
    public CompletePaymentResponse processCompletePayment(Integer orderId, PaymentRequest paymentRequest) {
        Order order = getOrderById(orderId);

        // Tạo invoice
        Invoice invoice = invoiceRepository.findByOrderId(orderId)
                .orElseGet(() -> {
                    Invoice newInvoice = Invoice.builder()
                            .orderId(orderId)
                            .subTotal(order.getSubTotal())
                            .discountAmount(order.getDiscountAmount())
                            .finalTotal(order.getFinalTotal())
                            .issuedBy(paymentRequest.getIssuedBy())
                            .build();
                    return invoiceRepository.save(newInvoice);
                });

        // Tạo payment record
        PaymentRecord paymentRecord = PaymentRecord.builder()
                .invoiceId(invoice.getInvoiceId())
                .methodId(paymentRequest.getMethodId())
                .amount(paymentRequest.getAmount())
                .notes(paymentRequest.getNotes())
                .build();

        paymentRecord = paymentRecordRepository.save(paymentRecord);

        // Cập nhật trạng thái order
        order.setStatusId(3); // Done
        orderRepository.save(order);

        // Cập nhật trạng thái bàn nếu là DINEIN
        if ("DINEIN".equalsIgnoreCase(order.getOrderType()) && order.getTableId() != null) {
            RestaurantTable table = restaurantTableRepository.findById(order.getTableId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy bàn"));
            table.setStatus("FREE");
            restaurantTableRepository.save(table);
        }

        return CompletePaymentResponse.builder()
                .orderId(orderId)
                .paymentRecordId(paymentRecord.getPaymentId())
                .invoiceNumber("INV-" + orderId + "-" + System.currentTimeMillis())
                .paidAmount(paymentRequest.getAmount())
                .totalAmount(order.getFinalTotal())
                .paymentDate(paymentRecord.getPaidAt())
                .paymentMethod(paymentRequest.getPaymentMethod())
                .status("COMPLETED")
                .message("Thanh toán thành công")
                .build();
    }

    @Override
    public CustomerPurchaseHistoryResponse getCustomerPurchaseHistoryByPhone(String phone) {
        List<Order> orders = orderRepository.findByPhoneOrderByCreatedAtDesc(phone);

        BigDecimal totalSpent = orders.stream()
                .filter(o -> o.getStatusId() == 3) // Done orders only
                .map(Order::getFinalTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Load invoices và payment records cho từng order
        for (Order order : orders) {
            // Sửa: findByOrderId trả về Optional, không phải List
            Optional<Invoice> invoiceOpt = invoiceRepository.findByOrderId(order.getOrderId());
            if (invoiceOpt.isPresent()) {
                Invoice invoice = invoiceOpt.get();
                List<PaymentRecord> paymentRecords = paymentRecordRepository.findByInvoiceId(invoice.getInvoiceId());
                invoice.setPaymentRecords(paymentRecords);
                order.setInvoices(List.of(invoice)); // Chuyển thành List
            }
        }

        return CustomerPurchaseHistoryResponse.builder()
                .phone(phone)
                .customerName(orders.isEmpty() ? null : orders.get(0).getCustomerName())
                .orders(orders)
                .totalSpent(totalSpent)
                .totalOrders(orders.size())
                .build();
    }

    private BigDecimal calculateSubTotal(List<OrderItemRequest> items) {
        if (items == null || items.isEmpty()) {
            return BigDecimal.ZERO;
        }

        BigDecimal subTotal = BigDecimal.ZERO;
        for (OrderItemRequest item : items) {
            BigDecimal itemTotal = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            subTotal = subTotal.add(itemTotal);
        }
        return subTotal;
    }

    @Override
    public Order getOrderById(Integer orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy order với ID: " + orderId));
    }

    @Override
    public List<Order> getActiveOrders() {
        return orderRepository.findByStatusIdIn(List.of(1, 2)); // Pending, Processing
    }

    @Override
    public List<Order> getOrdersByTable(Integer tableId) {
        return orderRepository.findByTableIdOrderByCreatedAtDesc(tableId);
    }

    @Override
    public Order updateOrderStatus(Integer orderId, Integer statusId) {
        Order order = getOrderById(orderId);
        order.setStatusId(statusId);
        return orderRepository.save(order);
    }

    @Override
    public List<RestaurantTable> getTablesByStatus(String status) {
        return restaurantTableRepository.findByStatus(status);
    }

    @Override
    public List<RestaurantTable> getTablesByArea(Integer areaId) {
        return restaurantTableRepository.findByAreaId(areaId);
    }

    @Override
    public List<RestaurantTable> getFreeTablesByArea(Integer areaId) {
        return restaurantTableRepository.findFreeTablesByArea(areaId);
    }

    @Override
    public Invoice getInvoiceByOrder(Integer orderId) {
        return invoiceRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy invoice cho order: " + orderId));
    }
    @Override
    public RestaurantTable updateTableStatus(Integer tableId, String status) {
        RestaurantTable table = restaurantTableRepository.findById(tableId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bàn với ID: " + tableId));

        table.setStatus(status);
        return restaurantTableRepository.save(table);
    }
}