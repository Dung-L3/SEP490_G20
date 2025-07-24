package com.system.restaurant.management.controller;

import com.system.restaurant.management.entity.PaymentMethod;
import com.system.restaurant.management.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping("/api/payments/{orderId}/qr")
    public ResponseEntity<Map<String,String>> getQrContent(
            @PathVariable Integer orderId,
            @RequestParam Integer methodId,
            @RequestParam BigDecimal amount) {

        String payload = String.format(
                "https://your-domain.com/pay?orderId=%d&methodId=%d&amount=%s",
                orderId, methodId, amount.toPlainString()
        );

        return ResponseEntity.ok(Map.of("qrContent", payload));
    }

    @GetMapping("/methodPayment")
    public List<PaymentMethod> getAllPaymentMethodNames() {
        return paymentService.getAllMethodNames();
    }
}
