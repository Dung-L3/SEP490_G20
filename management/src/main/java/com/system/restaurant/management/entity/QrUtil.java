package com.system.restaurant.management.entity;

import java.math.BigDecimal;

public class QrUtil {

    public static String generateEmvCoPayload(String accountName, String accountNumber, String bankBin, BigDecimal amount) {
        String payload = String.format(
                "00020101021238280010A000000727%s02%s530370454%03d5802VN5914%s6006HANOI",
                "12",  // GUID (VietQR - EMVCo 1.2)
                bankBin + accountNumber,
                amount.multiply(BigDecimal.valueOf(100)).intValue(),
                accountName.replace(" ", "").toUpperCase()
        );

        String crc = getCRC(payload + "6304");
        return payload + "6304" + crc;
    }

    private static String getCRC(String input) {
        int crc = 0xFFFF;
        for (char c : input.toCharArray()) {
            crc ^= (c << 8);
            for (int i = 0; i < 8; i++) {
                crc = (crc & 0x8000) != 0 ? (crc << 1) ^ 0x1021 : (crc << 1);
            }
        }
        return String.format("%04X", crc & 0xFFFF);
    }
}


