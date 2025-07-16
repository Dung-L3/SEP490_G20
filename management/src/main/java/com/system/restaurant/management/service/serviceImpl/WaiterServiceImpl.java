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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class WaiterServiceImpl implements WaiterService {

    private final OrderRepository orderRepository;
    private final RestaurantTableRepository restaurantTableRepository;
    private final ReservationRepository reservationRepository;
    private final InvoiceRepository invoiceRepository;
    private final PaymentRecordRepository paymentRecordRepository;
    private final PaymentMethodRepository paymentMethodRepository;
    private final DishRepository dishRepository;
    private final OrderDetailRepository orderDetailRepository;

    @Override
    public InvoiceResponseDTO getInvoiceResponseByOrder(Integer orderId) {
        Invoice invoice = invoiceRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn cho đơn hàng: " + orderId));

        Order order = invoice.getOrder();
        List<PaymentRecord> payments = paymentRecordRepository.findByInvoiceId(invoice.getInvoiceId());

        InvoiceResponseDTO response = new InvoiceResponseDTO();
        response.setInvoiceId(invoice.getInvoiceId());
        response.setInvoiceNumber("INV" + String.format("%011d", invoice.getInvoiceId()));
        response.setOrderId(order.getOrderId());
        response.setCustomerName(order.getCustomerName());
        response.setCustomerPhone(order.getPhone());
        response.setSubTotal(invoice.getSubTotal());
        response.setDiscount(invoice.getDiscountAmount());
        response.setFinalTotal(invoice.getFinalTotal());

        // Set payment info if available
        if (!payments.isEmpty()) {
            PaymentRecord latestPayment = payments.get(0);
            PaymentMethod paymentMethod = paymentMethodRepository.findById(latestPayment.getMethodId())
                    .orElseThrow(() -> new RuntimeException("Payment method not found: " + latestPayment.getMethodId()));
            response.setPaymentMethod(paymentMethod.getMethodName());
            response.setPaymentDate(latestPayment.getPaidAt());
        }

        response.setStatus(getOrderStatusName(order.getStatusId()));

        List<InvoiceItemDTO> items = order.getOrderDetails().stream()
                .map(detail -> {
                    InvoiceItemDTO item = new InvoiceItemDTO();
                    item.setDishName(detail.getDishName());
                    item.setQuantity(detail.getQuantity());
                    item.setUnitPrice(detail.getUnitPrice());
                    item.setTotal(detail.getUnitPrice()
                            .multiply(BigDecimal.valueOf(detail.getQuantity())));
                    return item;
                })
                .collect(Collectors.toList());

        response.setItems(items);

        return response;
    }

    private String getOrderStatusName(Integer statusId) {
        return switch (statusId) {
            case 1 -> "PENDING";
            case 2 -> "IN_PROGRESS";
            case 3 -> "COMPLETED";
            case 4 -> "CANCELLED";
            default -> "UNKNOWN";
        };
    }

    @Override
    public Order createOrderWithReservationTracking(CreateOrderRequest request) {
        String customerName = request.getCustomerName();
        String phone = request.getCustomerPhone();

        if (request.getReservationId() != null) {
            Optional<Reservation> reservation = reservationRepository.findById(request.getReservationId());
            if (reservation.isPresent()) {
                Reservation res = reservation.get();
                customerName = res.getCustomerName();
                phone = res.getPhone();
            }
        }

        if (phone == null || phone.trim().isEmpty()) {
            throw new IllegalArgumentException("Số điện thoại khách hàng là bắt buộc");
        }
        if (customerName == null || customerName.trim().isEmpty()) {
            throw new IllegalArgumentException("Tên khách hàng là bắt buộc");
        }

        BigDecimal subTotal = calculateSubTotal(request.getItems());
        BigDecimal discountAmount = BigDecimal.ZERO;
        BigDecimal finalTotal = subTotal.subtract(discountAmount);

        Order order = Order.builder()
                .orderType(request.getOrderType())
                .customerName(customerName)
                .phone(phone)
                .subTotal(subTotal)
                .discountAmount(discountAmount)
                .finalTotal(finalTotal)
                .statusId(1)
                .isRefunded(0) // 0 thay vì false
                .notes(request.getNotes())
                .createdAt(LocalDateTime.now())
                .build();

        if (request.getTableId() != null) {
            Optional<RestaurantTable> table = restaurantTableRepository.findById(request.getTableId());
            if (table.isPresent()) {
                order.setTable(table.get());
                if ("DINEIN".equalsIgnoreCase(request.getOrderType())) {
                    RestaurantTable tableToUpdate = table.get();
                    tableToUpdate.setStatus("OCCUPIED");
                    restaurantTableRepository.save(tableToUpdate);
                }
            }
        }

        return orderRepository.save(order);
    }

    @Override
    public Order createDineInOrder(CreateDineInOrderRequest request) {
        CreateOrderRequest orderRequest = new CreateOrderRequest();
        orderRequest.setTableId(request.getTableId());
        orderRequest.setReservationId(request.getReservationId());
        orderRequest.setOrderType("DINEIN");
        orderRequest.setCustomerName(request.getCustomerName());
        orderRequest.setCustomerPhone(request.getCustomerPhone());
        orderRequest.setNotes(request.getNotes());
        orderRequest.setItems(request.getOrderItems());

        return createOrderWithReservationTracking(orderRequest);
    }

    @Override
    public Order createTakeawayOrder(CreateTakeawayOrderRequest request) {
        if (request.getCustomerPhone() == null || request.getCustomerPhone().trim().isEmpty()) {
            throw new IllegalArgumentException("Số điện thoại khách hàng là bắt buộc cho đơn mang đi");
        }
        if (request.getCustomerName() == null || request.getCustomerName().trim().isEmpty()) {
            throw new IllegalArgumentException("Tên khách hàng là bắt buộc cho đơn mang đi");
        }

        CreateOrderRequest orderRequest = new CreateOrderRequest();
        orderRequest.setOrderType("TAKEAWAY");
        orderRequest.setCustomerName(request.getCustomerName());
        orderRequest.setCustomerPhone(request.getCustomerPhone());
        orderRequest.setNotes(request.getNotes());
        orderRequest.setItems(request.getOrderItems());

        return createOrderWithReservationTracking(orderRequest);
    }

    @Override
    public CheckInResponse checkInReservation(Integer reservationId, Integer tableId) {
        Optional<Reservation> reservation = reservationRepository.findById(reservationId);
        if (reservation.isEmpty()) {
            throw new RuntimeException("Không tìm thấy reservation với ID: " + reservationId);
        }

        Reservation res = reservation.get();
        res.setStatusId(2); // 2 = Confirmed
        reservationRepository.save(res);

        CreateOrderRequest orderRequest = new CreateOrderRequest();
        orderRequest.setReservationId(reservationId);
        orderRequest.setTableId(tableId);
        orderRequest.setOrderType("DINEIN");
        orderRequest.setCustomerName(res.getCustomerName());
        orderRequest.setCustomerPhone(res.getPhone());
        orderRequest.setNotes("Check-in từ reservation");

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

        PaymentRecord paymentRecord = PaymentRecord.builder()
                .invoiceId(invoice.getInvoiceId())
                .methodId(paymentRequest.getMethodId())
                .amount(paymentRequest.getAmount())
                .notes(paymentRequest.getNotes())
                .build();

        paymentRecord = paymentRecordRepository.save(paymentRecord);

        order.setStatusId(3); // 3 = Done
        orderRepository.save(order);

        if ("DINEIN".equalsIgnoreCase(order.getOrderType()) && order.getTable() != null) {
            RestaurantTable table = order.getTable();
            table.setStatus("AVAILABLE"); // AVAILABLE thay vì FREE
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
    public List<Order> getOrdersByTable(Integer tableId) {
        return orderRepository.findByTable_TableId(tableId);
    }

    @Override
    public List<Order> getActiveOrders() {
        return orderRepository.findByStatusIdIn(List.of(1, 2, 3));
    }

    @Override
    public Order getOrderById(Integer orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với ID: " + orderId));
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
    public RestaurantTable updateTableStatus(Integer tableId, String status) {
        RestaurantTable table = restaurantTableRepository.findById(tableId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bàn với ID: " + tableId));
        table.setStatus(status);
        return restaurantTableRepository.save(table);
    }

    @Override
    public CustomerPurchaseHistoryResponse getCustomerPurchaseHistoryByPhone(String phone) {
        List<Order> orders = orderRepository.findByPhone(phone);

        List<Order> completeOrders = orders.stream()
                .filter(order -> order.getStatusId() == 4)
                .toList();

        BigDecimal totalSpent = completeOrders.stream()
                .map(Order::getFinalTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        CustomerPurchaseHistoryResponse response = new CustomerPurchaseHistoryResponse();
        response.setPhone(phone);
        response.setOrders(completeOrders);
        response.setTotalSpent(totalSpent);
        response.setTotalOrders(completeOrders.size());

        if (!completeOrders.isEmpty()) {
            response.setCustomerName(completeOrders.get(0).getCustomerName());
        }

        return response;
    }

    @Override
    public List<Order> getOrdersByType(String orderType) {
        return orderRepository.findByOrderType(orderType);
    }

    @Override
    public Invoice getInvoiceById(Integer invoiceId) {
        return invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn với ID: " + invoiceId));
    }

    @Override
    public List<PaymentRecord> getPaymentRecordsByInvoice(Integer invoiceId) {
        return paymentRecordRepository.findByInvoiceId(invoiceId);
    }

    @Override
    public List<PaymentRecord> getPaymentRecordsByOrder(Integer orderId) {
        return paymentRecordRepository.findByOrderId(orderId);
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
    public List<RestaurantTable> getWindowTables() {
        return restaurantTableRepository.findByIsWindow(true);
    }

    @Override
    public List<RestaurantTable> getFreeWindowTables() {
        return restaurantTableRepository.findFreeWindowTables();
    }

    @Override
    public List<RestaurantTable> getTablesByType(String tableType) {
        return restaurantTableRepository.findByTableType(tableType);
    }

    @Override
    public RestaurantTable getTableByName(String tableName) {
        return restaurantTableRepository.findByTableName(tableName)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bàn với tên: " + tableName));
    }

    private BigDecimal calculateSubTotal(List<OrderItemRequest> items) {
        if (items == null || items.isEmpty()) {
            return BigDecimal.ZERO;
        }

        return items.stream()
                .map(item -> {
                    BigDecimal price = item.getUnitPrice() != null ? item.getUnitPrice() : BigDecimal.ZERO;
                    Integer quantity = item.getQuantity() != null ? item.getQuantity() : 0;
                    return price.multiply(BigDecimal.valueOf(quantity));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
