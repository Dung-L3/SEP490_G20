package com.system.restaurant.management.service.serviceImpl;

import com.system.restaurant.management.entity.PaymentMethod;
import com.system.restaurant.management.repository.PaymentMethodRepository;
import com.system.restaurant.management.service.PaymentService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PaymentServiceImpl implements PaymentService {

    private final PaymentMethodRepository paymentMethodRepository;

    public PaymentServiceImpl(PaymentMethodRepository paymentMethodRepository) {
        this.paymentMethodRepository = paymentMethodRepository;
    }

    @Override
    public List<PaymentMethod> getAllMethodNames() {
        return paymentMethodRepository.findAll();
    }
}