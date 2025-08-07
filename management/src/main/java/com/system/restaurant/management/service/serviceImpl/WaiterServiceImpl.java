package com.system.restaurant.management.service.serviceImpl;

import com.system.restaurant.management.dto.*;
import com.system.restaurant.management.entity.*;
import com.system.restaurant.management.exception.ResourceNotFoundException;
import com.system.restaurant.management.repository.*;
import com.system.restaurant.management.service.WaiterService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class WaiterServiceImpl implements WaiterService {

    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;
    private final RestaurantTableRepository restaurantTableRepository;
    private final ReservationRepository reservationRepository;
    private final InvoiceRepository invoiceRepository;
    private final PaymentRecordRepository paymentRecordRepository;
    private final PaymentMethodRepository paymentMethodRepository;
    private final DishRepository dishRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final OrderStatusRepository orderStatusRepository;
    private final ComboRepository comboRepository;
    private final InvoicePrintRepository invoicePrintRepository;
    private final LoyaltyTransactionRepository loyaltyTransactionRepository;



    @Override
    public boolean isTableOccupied(Integer tableId) {
        return restaurantTableRepository.findById(tableId)
                .map(table -> "OCCUPIED".equals(table.getStatus()))
                .orElse(false);
    }

    @Override
    public Order createDineInOrder(CreateDineInOrderRequest request) {
        RestaurantTable table = restaurantTableRepository.findById(request.getTableId())
                .orElseThrow(() -> new ResourceNotFoundException("Table not found"));

        if (!"OCCUPIED".equals(table.getStatus())) {
            throw new IllegalStateException("Table must be OCCUPIED to place an order");
        }

        Order order = Order.builder()
                .orderType("DINE_IN")
                .tableId(request.getTableId())
                .statusId(1) // Pending
                .subTotal(BigDecimal.ZERO)
                .discountAmount(BigDecimal.ZERO)
                .finalTotal(BigDecimal.ZERO)
                .createdAt(LocalDateTime.now())
                .build();

        order = orderRepository.save(order);

        List<OrderDetail> details = createOrderDetails(request.getItems(), order);
        BigDecimal subTotal = calculateOrderSubTotal(details);
        order.setSubTotal(subTotal);
        order.setFinalTotal(subTotal);

        return orderRepository.save(order);
    }

    @Override
    public List<Order> getActiveOrdersByTable(Integer tableId) {
        return orderRepository.findByTableIdAndStatusIdIn(tableId, List.of(1, 2)); // Pending and Processing
    }

    private List<OrderDetail> createOrderDetails(List<OrderItemRequest> items, Order order) {
        if (items == null || items.isEmpty()) {
            throw new IllegalArgumentException("Order must have at least one item");
        }

        return items.stream()
                .map(item -> {
                    OrderDetail detail = OrderDetail.builder()
                            .orderId(order.getOrderId())
                            .quantity(item.getQuantity())
                            .statusId(1) // Pending
                            .isRefunded(0)
                            .notes(item.getNotes())
                            .build();

                    if (item.getDishId() != null) {
                        Dish dish = dishRepository.findById(item.getDishId())
                                .orElseThrow(() -> new ResourceNotFoundException("Dish not found: " + item.getDishId()));
                        detail.setDishId(dish.getDishId());
                        detail.setUnitPrice(dish.getPrice());
                    } else if (item.getComboId() != null) {
                        Combo combo = comboRepository.findById(item.getComboId())
                                .orElseThrow(() -> new ResourceNotFoundException("Combo not found: " + item.getComboId()));
                        detail.setComboId(combo.getComboId());
                        detail.setUnitPrice(combo.getPrice());
                    } else {
                        throw new IllegalArgumentException("Either dishId or comboId must be provided");
                    }

                    return orderDetailRepository.save(detail);
                })
                .collect(Collectors.toList());
    }

    private BigDecimal calculateOrderSubTotal(List<OrderDetail> details) {
        return details.stream()
                .map(detail -> detail.getUnitPrice()
                        .multiply(BigDecimal.valueOf(detail.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Override
    public RestaurantTable getTableByName(String tableName) {
        return restaurantTableRepository.findByTableName(tableName)
                .orElseThrow(() -> new ResourceNotFoundException("Table not found with name: " + tableName));
    }

    @Override
    public List<RestaurantTable> getWindowTables() {
        return restaurantTableRepository.findWindowTables();
    }

    @Override
    public List<RestaurantTable> getFreeWindowTables() {
        return restaurantTableRepository.getFreeWindowTables();
    }

    @Override
    public List<RestaurantTable> getTablesByType(String tableType) {
        return restaurantTableRepository.findByTableType(tableType);
    }
    @Autowired
    private HttpServletRequest request;

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

//    @Override
//    public Order createTakeawayOrder(CreateTakeawayOrderRequest request) {
//        if (request.getCustomerPhone() == null || request.getCustomerPhone().trim().isEmpty()) {
//            throw new IllegalArgumentException("Số điện thoại khách hàng là bắt buộc cho đơn mang đi");
//        }
//        if (request.getCustomerName() == null || request.getCustomerName().trim().isEmpty()) {
//            throw new IllegalArgumentException("Tên khách hàng là bắt buộc cho đơn mang đi");
//        }
//
//        CreateOrderRequest orderRequest = new CreateOrderRequest();
//        orderRequest.setOrderType("TAKEAWAY");
//        orderRequest.setCustomerName(request.getCustomerName());
//        orderRequest.setCustomerPhone(request.getCustomerPhone());
//        orderRequest.setNotes(request.getNotes());
//        orderRequest.setItems(request.getOrderItems());
//
//        return createOrderWithReservationTracking(orderRequest);
//    }

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
    @Transactional
    public CompletePaymentResponse processCompletePayment(Integer orderId,
                                                          PaymentRequest paymentRequest) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Order not found: " + orderId));

        Integer issuedBy = (Integer) request.getSession().getAttribute("userId");
        if (issuedBy == null) {
            throw new AccessDeniedException("Chưa đăng nhập hoặc session hết hạn");
        }

        String pmName = paymentRequest.getPaymentMethod().trim();
        PaymentMethod pmEntity = paymentMethodRepository
                .findByMethodName(pmName)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Payment method not found: " + pmName));
        Integer methodId = pmEntity.getMethodId();

        Invoice invoice = invoiceRepository.findByOrderId(orderId)
                .orElseGet(() -> {
                    Invoice inv = Invoice.builder()
                            .orderId(orderId)
                            .subTotal(order.getSubTotal())
                            .discountAmount(order.getDiscountAmount())
                            .finalTotal(order.getFinalTotal())
                            .issuedBy(issuedBy)
                            .build();
                    return invoiceRepository.save(inv);
                });

        PaymentRecord pr = PaymentRecord.builder()
                .invoiceId(invoice.getInvoiceId())
                .methodId(methodId)
                .amount(order.getFinalTotal())
                .notes("Paid via " + pmEntity.getMethodName())
                .paidAt(LocalDateTime.now())
                .build();
        pr = paymentRecordRepository.save(pr);

        OrderStatus done = orderStatusRepository.findByStatusName("Done")
                .orElseThrow(() -> new EntityNotFoundException("Status 'Done' not found"));
        order.setStatusId(done.getStatusId());
        orderRepository.save(order);

        List<OrderDetail> details = orderDetailRepository.findByOrderId(orderId);
        for (OrderDetail od : details) {
            od.setStatusId(done.getStatusId());
        }
        orderDetailRepository.saveAll(details);

        if ("DINEIN".equalsIgnoreCase(order.getOrderType()) && order.getTable() != null) {
            RestaurantTable table = order.getTable();
            table.setStatus("FREE");
            restaurantTableRepository.save(table);
        }

        InvoicePrint ip = InvoicePrint.builder()
                .invoiceId(invoice.getInvoiceId())
                .printedBy(issuedBy)
                .printedAt(LocalDateTime.now())
                .build();
        invoicePrintRepository.save(ip);

        customerRepository.findByPhone(order.getPhone()).ifPresent(customer ->
        {BigDecimal subTotal = order.getSubTotal();
            int points = subTotal
                    .divide(new BigDecimal("100000"), RoundingMode.DOWN)
                    .intValue();
                customer.setLoyaltyPoints(customer.getLoyaltyPoints() + points);
                customerRepository.save(customer);
            LoyaltyTransaction tx = LoyaltyTransaction.builder()
                    .customerId(customer.getCustomerId())
                    .orderId(orderId)
                    .pointsChange(points)
                    .transactionAt(LocalDateTime.now())
                    .reason("Tích điểm cho hóa đơn #" + orderId)
                    .build();
            loyaltyTransactionRepository.save(tx);
        });

        return CompletePaymentResponse.builder()
                .orderId(orderId)
                .invoiceNumber("INV-" + invoice.getInvoiceId())
                .paymentRecordId(pr.getPaymentId())
                .paidAmount(pr.getAmount())
                .totalAmount(invoice.getFinalTotal())
                .paymentMethod(pmEntity.getMethodName())
                .paymentDate(pr.getPaidAt())
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

    @Override
    public OrderDetail getOrderDetailById(Integer orderDetailId) {
        return orderDetailRepository.findById(orderDetailId)
                .orElseThrow(() -> new ResourceNotFoundException(
                    "OrderDetail",
                    "orderDetailId",
                    orderDetailId
                ));
    }
}
