package com.system.restaurant.management.controller;

import com.system.restaurant.management.dto.NotificationRequestDto;
import com.system.restaurant.management.entity.Invoice;
import com.system.restaurant.management.entity.KitchenTicket;
import com.system.restaurant.management.entity.Notification;
import com.system.restaurant.management.service.SystemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/system")
public class SystemController {

    private final SystemService svc;
    public SystemController(SystemService svc) {
        this.svc = svc;
    }

    @PostMapping("/orders/{orderId}/invoice")
    public ResponseEntity<Invoice> generateInvoice(@PathVariable Long orderId) {
        return ResponseEntity.ok(svc.generateInvoice(orderId));
    }

    @PostMapping("/notifications")
    public ResponseEntity<Notification> sendNotification(@RequestBody NotificationRequestDto requestDto) {
        return ResponseEntity.ok(svc.sendNotification(requestDto));
    }

    @PostMapping("/orders/{orderId}/kitchen-ticket")
    public ResponseEntity<KitchenTicket> triggerKitchenTicket(@PathVariable Long orderId) {
        return ResponseEntity.ok(svc.triggerKitchenTicket(orderId));
    }

    @PostMapping("/reservations/{resId}/lock")
    public ResponseEntity<Void> lockReservationEdit(@PathVariable Long resId) {
        svc.lockReservationEdit(resId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/orders/{orderId}/lock")
    public ResponseEntity<Void> lockOrderEdit(@PathVariable Long orderId) {
        svc.lockOrderEdit(orderId);
        return ResponseEntity.ok().build();
    }
}