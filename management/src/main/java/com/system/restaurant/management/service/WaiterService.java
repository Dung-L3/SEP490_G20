package com.system.restaurant.management.service;

import com.system.restaurant.management.dto.*;
import com.system.restaurant.management.entity.*;

import java.util.List;

public interface WaiterService {
    boolean isTableOccupied(Integer tableId);
    List<Order> getActiveOrdersByTable(Integer tableId);

    Order createOrderWithReservationTracking(CreateOrderRequest request);
    Order createDineInOrder(CreateDineInOrderRequest request);
    Order createTakeawayOrder(CreateTakeawayOrderRequest request);
    CheckInResponse checkInReservation(Integer reservationId, Integer tableId);
    CompletePaymentResponse processCompletePayment(Integer orderId, PaymentRequest paymentRequest);

    List<Order> getOrdersByTable(Integer tableId);
    List<Order> getActiveOrders();
    Order getOrderById(Integer orderId);
    Order updateOrderStatus(Integer orderId, Integer statusId);
    OrderDetail getOrderDetailById(Integer orderDetailId);

    List<RestaurantTable> getTablesByStatus(String status);
    RestaurantTable updateTableStatus(Integer tableId, String status);

    CustomerPurchaseHistoryResponse getCustomerPurchaseHistoryByPhone(String phone);
    List<Order> getOrdersByType(String orderType);

    InvoiceResponseDTO getInvoiceResponseByOrder(Integer orderId);
    Invoice getInvoiceById(Integer invoiceId);

    List<PaymentRecord> getPaymentRecordsByInvoice(Integer invoiceId);
    List<PaymentRecord> getPaymentRecordsByOrder(Integer orderId);

    List<RestaurantTable> getTablesByArea(Integer areaId);
    List<RestaurantTable> getFreeTablesByArea(Integer areaId);
    List<RestaurantTable> getWindowTables();
    List<RestaurantTable> getFreeWindowTables();
    List<RestaurantTable> getTablesByType(String tableType);
    RestaurantTable getTableByName(String tableName);
}