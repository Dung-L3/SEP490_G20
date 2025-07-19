// src/main/java/com/system/restaurant/management/config/MerchantAccountsConfig.java
package com.system.restaurant.management.config;

import com.system.restaurant.management.dto.MerchantAccountInfo;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@ConfigurationProperties(prefix = "payment.merchant")
@Data
public class MerchantAccountsConfig {

    private Map<String, MerchantAccountInfo> methods;
    private String accountName;
    private String accountNumber;
    private String bankBin;
    private String bankName;
}
