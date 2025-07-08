package com.system.restaurant.management.service;

import com.system.restaurant.management.dto.*;
import com.system.restaurant.management.entity.*;

import java.util.List;

public interface WaiterService {
    Order createOrderWithReservationTracking(CreateOrderRequest request);
    Order createDineInOrder(CreateDineInOrderRequest request);
    Order createTakeawayOrder(CreateTakeawayOrderRequest request);
    CheckInResponse checkInReservation(Integer reservationId, Integer tableId);
    CompletePaymentResponse processCompletePayment(Integer orderId, PaymentRequest paymentRequest);
    CustomerPurchaseHistoryResponse getCustomerPurchaseHistoryByPhone(String phone);
    Order getOrderById(Integer orderId);
    List<Order> getActiveOrders();
    List<Order> getOrdersByTable(Integer tableId);
    Order updateOrderStatus(Integer orderId, Integer statusId);
    List<RestaurantTable> getTablesByStatus(String status);
    List<RestaurantTable> getTablesByArea(Integer areaId);
    List<RestaurantTable> getFreeTablesByArea(Integer areaId);
    Invoice getInvoiceByOrder(Integer orderId);
    RestaurantTable updateTableStatus(Integer tableId, String status);
}