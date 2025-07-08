package com.system.restaurant.management.service;

import com.system.restaurant.management.dto.*;
import com.system.restaurant.management.entity.*;
import java.util.List;

public interface WaiterService {
    // Order Management
    Order createOrderWithReservationTracking(CreateOrderRequest request);
    Order createDineInOrder(CreateDineInOrderRequest request);
    Order createTakeawayOrder(CreateTakeawayOrderRequest request);
    List<Order> getOrdersByTable(Integer tableId);
    List<Order> getActiveOrders();
    Order getOrderById(Integer orderId);
    Order updateOrderStatus(Integer orderId, Integer statusId);

    // Table Management - Basic
    List<RestaurantTable> getTablesByStatus(String status);
    RestaurantTable updateTableStatus(Integer tableId, String status);

    // Table Management - Advanced
    List<RestaurantTable> getTablesByArea(Integer areaId);
    List<RestaurantTable> getFreeTablesByArea(Integer areaId);
    List<RestaurantTable> getWindowTables();
    List<RestaurantTable> getFreeWindowTables();
    List<RestaurantTable> getTablesByType(String tableType);
    RestaurantTable getTableByName(String tableName);

    // Customer Purchase History
    CustomerPurchaseHistoryResponse getCustomerPurchaseHistoryByPhone(String phone);

    // Reservation Management
    CheckInResponse checkInReservation(Integer reservationId, Integer tableId);

    // Payment Management
    CompletePaymentResponse processCompletePayment(Integer orderId, PaymentRequest request);

    // Order Types
    List<Order> getOrdersByType(String orderType);

    // Invoice Management
    Invoice getInvoiceByOrder(Integer orderId);
    Invoice getInvoiceById(Integer invoiceId);

    // Payment Records
    List<PaymentRecord> getPaymentRecordsByInvoice(Integer invoiceId);
    List<PaymentRecord> getPaymentRecordsByOrder(Integer orderId);
}