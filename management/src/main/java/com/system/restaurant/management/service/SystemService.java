package com.system.restaurant.management.service;

import com.system.restaurant.management.dto.NotificationRequestDto;
import com.system.restaurant.management.entity.Invoice;
import com.system.restaurant.management.entity.KitchenTicket;
import com.system.restaurant.management.entity.Notification;

public interface SystemService {
    Invoice generateInvoice(Long orderId);
    Notification sendNotification(NotificationRequestDto dto);
    KitchenTicket triggerKitchenTicket(Long orderId);
    void lockReservationEdit(Long reservationId);
    void lockOrderEdit(Long orderId);
}