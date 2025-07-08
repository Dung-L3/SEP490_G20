package com.system.restaurant.management.dto;

import lombok.Data;
import com.system.restaurant.management.entity.*;

@Data
public class CompletePaymentResponse {
    private Order order;
    private Invoice invoice;
    private PaymentRecord paymentRecord;
    private String message;
}