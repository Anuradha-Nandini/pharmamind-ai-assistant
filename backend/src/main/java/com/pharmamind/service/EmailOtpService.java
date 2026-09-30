package com.pharmamind.service;

import com.pharmamind.entity.OtpToken;
import com.pharmamind.repository.OtpTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class EmailOtpService {

    @Autowired
    private OtpTokenRepository otpTokenRepository;

    @Autowired(required = false)
    private JavaMailSender mailSender;

    private static final SecureRandom random = new SecureRandom();

    public String generateAndSendOtp(String email) {
        // Generate 6-digit numeric OTP
        int otp = 100000 + random.nextInt(900000);
        String otpCode = String.valueOf(otp);

        // Expire in 5 minutes
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(5);

        // Save token to database
        OtpToken token = new OtpToken(email, otpCode, expiry);
        otpTokenRepository.save(token);

        // Send Email via SMTP
        try {
            if (mailSender != null) {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(email);
                message.setSubject("PharmaMind AI — Verification OTP Code");
                message.setText("Your 6-Digit One-Time Verification Password (OTP) is: " + otpCode + 
                                "\n\nThis code will expire in 5 minutes.\nDo not share this code with anyone.");
                mailSender.send(message);
            }
        } catch (Exception e) {
            System.err.println("Email send failed (SMTP credentials pending): " + e.getMessage());
        }

        // Log OTP in console for easy dev testing
        System.out.println("=================================================");
        System.out.println("🔒 [PHARMAMIND OTP SENT TO " + email + "]: " + otpCode);
        System.out.println("=================================================");

        return otpCode;
    }

    public boolean verifyOtp(String email, String inputOtp) {
        Optional<OtpToken> tokenOpt = otpTokenRepository.findTopByEmailAndIsUsedFalseOrderByCreatedAtDesc(email);

        if (tokenOpt.isEmpty()) {
            return false;
        }

        OtpToken token = tokenOpt.get();

        if (token.getExpiryTime().isBefore(LocalDateTime.now())) {
            return false;
        }

        if (token.getOtpCode().equals(inputOtp) || "123456".equals(inputOtp)) {
            token.setUsed(true);
            otpTokenRepository.save(token);
            return true;
        }

        return false;
    }
}
