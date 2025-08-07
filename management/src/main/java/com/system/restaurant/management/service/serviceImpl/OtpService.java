package com.system.restaurant.management.service.serviceImpl;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Service
public class OtpService {

    private final JavaMailSender mailSender;
    private final Map<String, OtpEntry> cache = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();

    public OtpService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void generateAndSendOtp(String email) {
        String otp = String.format("%06d", new Random().nextInt(1_000_000));
        Instant expires = Instant.now().plus(15, ChronoUnit.MINUTES);
        cache.put(email, new OtpEntry(otp, expires));
        scheduler.schedule(() -> cache.remove(email), 15, TimeUnit.MINUTES);

        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(email);
        msg.setSubject("Mã OTP đặt lại mật khẩu");
        msg.setText("Mã OTP: " + otp + " (hết hạn 15 phút)");
        mailSender.send(msg);
    }

    public boolean validateOtp(String email, String otp) {
        OtpEntry e = cache.get(email);
        if (e == null || Instant.now().isAfter(e.expires)) return false;
        boolean ok = e.otp.equals(otp);
        if (ok) cache.remove(email);
        return ok;
    }

    private static class OtpEntry {
        final String otp;
        final Instant expires;
        OtpEntry(String otp, Instant expires) { this.otp = otp; this.expires = expires; }
    }
}
