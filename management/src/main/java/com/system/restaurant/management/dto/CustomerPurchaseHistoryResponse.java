package com.system.restaurant.management.dto;

import lombok.Data;
import com.system.restaurant.management.entity.*;
import java.util.List;
import java.math.BigDecimal;

@Data
public class CustomerPurchaseHistoryResponse {
    private String customerName;
    private String phone;
    private List<Order> orders;
    private List<Invoice> invoices;
    private List<PaymentRecord> paymentRecords;
    private BigDecimal totalSpent;
    private Integer totalOrders;
}