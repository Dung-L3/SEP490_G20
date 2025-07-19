package com.system.restaurant.management.service.serviceImpl;

import com.system.restaurant.management.dto.MerchantAccountInfo;
import com.system.restaurant.management.config.MerchantAccountsConfig;
import com.system.restaurant.management.entity.QrUtil;
import com.system.restaurant.management.entity.PaymentMethod;
import com.system.restaurant.management.repository.PaymentMethodRepository;
import com.system.restaurant.management.service.PaymentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PaymentServiceImpl implements PaymentService {

    private final MerchantAccountsConfig merchantConfig;

    @Autowired
    public PaymentServiceImpl(MerchantAccountsConfig merchantConfig) {
        this.merchantConfig = merchantConfig;
    }

    private static final String ACCOUNT_NO = "0372698544";
    private static final String ACCOUNT_NAME = "TRAN NAM THANH";
    private static final String BANK_BIN = "970422"; // MB Bank

//    @Override
//    public Map<String, String> generateQrPayload(Integer orderId, String paymentMethod, BigDecimal amount) {
//        PaymentMethod method = paymentMethodRepository.findByMethodName(paymentMethod)
//                .orElseThrow(() -> new IllegalArgumentException("Phương thức thanh toán không hợp lệ"));
//
//        String payload = QrUtil.generateVietQRPayload(
//                ACCOUNT_NO,
//                ACCOUNT_NAME,
//                BANK_BIN,
//                amount.toPlainString(),
//                orderId.toString()
//        );
//
//        Map<String, String> result = new HashMap<>();
//        result.put("qrContent", payload);
//        return result;
//    }


    @Override
    public List<String> getAllMethodNames() {
        return List.copyOf(merchantConfig.getMethods().keySet());
    }
}
