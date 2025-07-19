package com.system.restaurant.management.controller;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.system.restaurant.management.config.MerchantAccountsConfig;
import com.system.restaurant.management.entity.QrUtil;
import com.system.restaurant.management.service.PaymentService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService methodService;
    private final MerchantAccountsConfig merchantAccountConfig;

    @GetMapping("/{orderId}/qr-img")
    public ResponseEntity<byte[]> getQrImage(
            @PathVariable Integer orderId,
            @RequestParam BigDecimal amount
    ) throws WriterException, IOException {
        String payload = QrUtil.generateEmvCoPayload(
                merchantAccountConfig.getAccountName(),
                merchantAccountConfig.getAccountNumber(),
                merchantAccountConfig.getBankBin(),
                amount
        );

        BitMatrix matrix = new MultiFormatWriter()
                .encode(payload, BarcodeFormat.QR_CODE, 300, 300);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(matrix, "PNG", baos);
        byte[] image = baos.toByteArray();

        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG)
                .body(image);
    }



    @GetMapping("/methodPayment")
    public List<String> getAllPaymentMethodNames() {
        return methodService.getAllMethodNames();
    }
}
