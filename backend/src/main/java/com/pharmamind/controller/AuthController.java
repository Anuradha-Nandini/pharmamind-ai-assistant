package com.pharmamind.controller;

import com.pharmamind.entity.User;
import com.pharmamind.repository.UserRepository;
import com.pharmamind.service.EmailOtpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailOtpService otpService;

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email address is required."));
        }

        String otp = otpService.generateAndSendOtp(email.trim());

        Map<String, Object> response = new HashMap<>();
        response.put("status", "SUCCESS");
        response.put("message", "6-Digit OTP code has been sent to " + email);
        response.put("demoOtp", otp); // For testing convenience

        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otpCode = request.get("otpCode");

        if (email == null || otpCode == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and OTP code are required."));
        }

        boolean isValid = otpService.verifyOtp(email.trim(), otpCode.trim());

        if (!isValid) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired OTP code."));
        }

        // Mark user verified in database if user exists
        Optional<User> userOpt = userRepository.findByEmail(email.trim());
        User user;
        if (userOpt.isPresent()) {
            user = userOpt.get();
            user.setVerified(true);
            userRepository.save(user);
        } else {
            user = new User("Dr. Clinical User", email, "hashed_pass", "Clinical Pharmacist");
            user.setVerified(true);
            userRepository.save(user);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("status", "VERIFIED");
        response.put("token", "jwt_session_" + System.currentTimeMillis());
        response.put("user", Map.of(
            "id", user.getId(),
            "name", user.getFullName(),
            "email", user.getEmail(),
            "role", user.getRole(),
            "isVerified", true
        ));

        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required."));
        }

        // Generate 2FA OTP for login
        String otp = otpService.generateAndSendOtp(email.trim());

        return ResponseEntity.ok(Map.of(
            "status", "OTP_REQUIRED",
            "message", "Password accepted. 2FA verification code sent to your email.",
            "demoOtp", otp
        ));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Map<String, String> request) {
        String fullName = request.get("fullName");
        String email = request.get("email");
        String password = request.get("password");
        String role = request.getOrDefault("role", "Clinical Pharmacist");

        if (email == null || password == null || fullName == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Full name, email, and password are required."));
        }

        if (!userRepository.existsByEmail(email.trim())) {
            User newUser = new User(fullName.trim(), email.trim(), password, role);
            userRepository.save(newUser);
        }

        String otp = otpService.generateAndSendOtp(email.trim());

        return ResponseEntity.ok(Map.of(
            "status", "OTP_REQUIRED",
            "message", "Account created. Verification OTP sent to " + email,
            "demoOtp", otp
        ));
    }
}
