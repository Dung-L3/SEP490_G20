package com.system.restaurant.management.service.impl;

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
    private final RestaurantTableRepository restaurantTableRepository;
    private final ReservationRepository reservationRepository;
    private final InvoiceRepository invoiceRepository;
    private final PaymentRecordRepository paymentRecordRepository;

    @Override
    public Order createOrderWithReservationTracking(CreateOrderRequest request) {
        String customerName = request.getCustomerName();
        String phone = request.getCustomerPhone();

        // Lấy thông tin từ reservation nếu có
        if (request.getReservationId() != null) {
            Optional<Reservation> reservation = reservationRepository.findById(request.getReservationId());
            if (reservation.isPresent()) {
                Reservation res = reservation.get();
                customerName = res.getCustomerName();
                phone = res.getPhone();
            }
        }

        // Kiểm tra bắt buộc
        if (phone == null || phone.trim().isEmpty()) {
            throw new IllegalArgumentException("Customer phone is required");
        }
        if (customerName == null || customerName.trim().isEmpty()) {
            throw new IllegalArgumentException("Customer name is required");
        }

        // Tính toán tổng tiền
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
                .statusId(1) // Pending
                .isRefunded(false)
                .notes(request.getNotes())
                .build();

        // Set table nếu có
        if (request.getTableId() != null) {
            Optional<RestaurantTable> table = restaurantTableRepository.findById(request.getTableId());
            if (table.isPresent()) {
                order.setTable(table.get());
                // Cập nhật status bàn cho DINEIN
                if ("DINEIN".equalsIgnoreCase(request.getOrderType())) {
                    RestaurantTable tableEntity = table.get();
                    tableEntity.setStatus("OCCUPIED");
                    restaurantTableRepository.save(tableEntity);
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

        return createOrderWithReservationTracking(orderRequest);
    }

    @Override
    public Order createTakeawayOrder(CreateTakeawayOrderRequest request) {
        if (request.getCustomerPhone() == null || request.getCustomerPhone().trim().isEmpty()) {
            throw new IllegalArgumentException("Customer phone is required for takeaway order");
        }
        if (request.getCustomerName() == null || request.getCustomerName().trim().isEmpty()) {
            throw new IllegalArgumentException("Customer name is required for takeaway order");
        }

        CreateOrderRequest orderRequest = new CreateOrderRequest();
        orderRequest.setOrderType("TAKEAWAY");
        orderRequest.setCustomerName(request.getCustomerName());
        orderRequest.setCustomerPhone(request.getCustomerPhone());
        orderRequest.setNotes(request.getNotes());

        return createOrderWithReservationTracking(orderRequest);
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
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
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
                .orElseThrow(() -> new RuntimeException("Table not found with id: " + tableId));
        table.setStatus(status);
        return restaurantTableRepository.save(table);
    }

    @Override
    public CustomerPurchaseHistoryResponse getCustomerPurchaseHistoryByPhone(String phone) {
        List<Order> orders = orderRepository.findByPhone(phone);

        List<Order> completeOrders = orders.stream()
                .filter(order -> {
                    Optional<Invoice> invoice = invoiceRepository.findByOrderId(order.getOrderId());
                    if (invoice.isPresent()) {
                        List<PaymentRecord> payments = paymentRecordRepository.findByInvoiceId(invoice.get().getInvoiceId());
                        return !payments.isEmpty();
                    }
                    return false;
                })
                .toList();

        List<Integer> orderIds = completeOrders.stream().map(Order::getOrderId).toList();
        List<Invoice> invoices = invoiceRepository.findByOrderIdIn(orderIds);

        List<Integer> invoiceIds = invoices.stream().map(Invoice::getInvoiceId).toList();
        List<PaymentRecord> paymentRecords = paymentRecordRepository.findByInvoiceIdIn(invoiceIds);

        BigDecimal totalSpent = completeOrders.stream()
                .map(Order::getFinalTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        CustomerPurchaseHistoryResponse response = new CustomerPurchaseHistoryResponse();
        response.setPhone(phone);
        response.setOrders(completeOrders);
        response.setInvoices(invoices);
        response.setPaymentRecords(paymentRecords);
        response.setTotalSpent(totalSpent);
        response.setTotalOrders(completeOrders.size());

        if (!completeOrders.isEmpty()) {
            response.setCustomerName(completeOrders.get(0).getCustomerName());
        }

        return response;
    }

    @Override
    public CheckInResponse checkInReservation(Integer reservationId, Integer tableId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        RestaurantTable table = restaurantTableRepository.findById(tableId)
                .orElseThrow(() -> new RuntimeException("Table not found"));

        table.setStatus("OCCUPIED");
        restaurantTableRepository.save(table);

        CreateOrderRequest orderRequest = new CreateOrderRequest();
        orderRequest.setTableId(tableId);
        orderRequest.setReservationId(reservationId);
        orderRequest.setOrderType("DINEIN");
        orderRequest.setNotes("Created from reservation check-in");

        Order savedOrder = createOrderWithReservationTracking(orderRequest);

        CheckInResponse response = new CheckInResponse();
        response.setReservation(reservation);
        response.setTable(table);
        response.setCreatedOrder(savedOrder);
        response.setMessage("Check-in successful. Order created with customer info from reservation.");

        return response;
    }

    @Override
    public CompletePaymentResponse processCompletePayment(Integer orderId, PaymentRequest request) {
        Order order = getOrderById(orderId);

        Invoice invoice = Invoice.builder()
                .orderId(orderId)
                .invoiceNumber("INV-" + System.currentTimeMillis())
                .totalAmount(order.getSubTotal())
                .discountAmount(order.getDiscountAmount())
                .finalAmount(order.getFinalTotal())
                .customerPhone(order.getPhone())
                .customerName(order.getCustomerName())
                .build();

        Invoice savedInvoice = invoiceRepository.save(invoice);

        PaymentRecord paymentRecord = PaymentRecord.builder()
                .invoiceId(savedInvoice.getInvoiceId())
                .methodId(request.getMethodId())
                .amount(request.getAmount())
                .notes(request.getNotes())
                .build();

        PaymentRecord savedPaymentRecord = paymentRecordRepository.save(paymentRecord);

        order.setStatusId(4); // Completed
        Order updatedOrder = orderRepository.save(order);

        if ("DINEIN".equalsIgnoreCase(order.getOrderType()) && order.getTable() != null) {
            RestaurantTable table = order.getTable();
            table.setStatus("FREE");
            restaurantTableRepository.save(table);
        }

        CompletePaymentResponse response = new CompletePaymentResponse();
        response.setOrder(updatedOrder);
        response.setInvoice(savedInvoice);
        response.setPaymentRecord(savedPaymentRecord);
        response.setMessage("Payment completed successfully. Order completed and table freed.");

        return response;
    }

    @Override
    public List<Order> getOrdersByType(String orderType) {
        return orderRepository.findByOrderType(orderType);
    }

    @Override
    public Invoice getInvoiceByOrder(Integer orderId) {
        return invoiceRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Invoice not found for order: " + orderId));
    }

    @Override
    public Invoice getInvoiceById(Integer invoiceId) {
        return invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found with id: " + invoiceId));
    }

    @Override
    public List<PaymentRecord> getPaymentRecordsByInvoice(Integer invoiceId) {
        return paymentRecordRepository.findByInvoiceId(invoiceId);
    }

    @Override
    public List<PaymentRecord> getPaymentRecordsByOrder(Integer orderId) {
        Optional<Invoice> invoice = invoiceRepository.findByOrderId(orderId);
        if (invoice.isPresent()) {
            return paymentRecordRepository.findByInvoiceId(invoice.get().getInvoiceId());
        }
        return List.of();
    }

    private BigDecimal calculateSubTotal(List<OrderItemRequest> items) {
        if (items == null || items.isEmpty()) {
            return BigDecimal.ZERO;
        }

        return items.stream()
                .map(item -> {
                    BigDecimal unitPrice = item.getUnitPrice() != null ? item.getUnitPrice() : BigDecimal.ZERO;
                    Integer quantity = item.getQuantity() != null ? item.getQuantity() : 0;
                    return unitPrice.multiply(BigDecimal.valueOf(quantity));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // table management
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
                .orElseThrow(() -> new RuntimeException("Table not found with name: " + tableName));
    }
}