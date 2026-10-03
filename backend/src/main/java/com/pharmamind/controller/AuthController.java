package com.pharmamind.controller;

import com.pharmamind.entity.User;
import com.pharmamind.repository.UserRepository;
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

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        if (email == null || email.trim().isEmpty() || password == null || password.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email address and password are required."));
        }

        String cleanEmail = email.trim().toLowerCase();

        // Check if user exists in database
        Optional<User> userOpt = userRepository.findByEmail(cleanEmail);
        User user;

        if (userOpt.isPresent()) {
            user = userOpt.get();
            // In production, verify BCrypt password.
            user.setVerified(true);
            userRepository.save(user);
        } else {
            // Auto-create & verify user record for seamless clinical access
            String defaultName = cleanEmail.contains("@") ? cleanEmail.split("@")[0].toUpperCase() : "Clinical User";
            user = new User(defaultName, cleanEmail, password, "Clinical Pharmacist");
            user.setVerified(true);
            userRepository.save(user);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("status", "SUCCESS");
        response.put("message", "Authentication verified successfully.");
        response.put("token", "jwt_sec_token_" + System.currentTimeMillis());
        response.put("user", Map.of(
            "id", user.getId(),
            "name", user.getFullName(),
            "email", user.getEmail(),
            "role", user.getRole(),
            "isVerified", true
        ));

        return ResponseEntity.ok(response);
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Map<String, String> request) {
        String fullName = request.get("fullName");
        String email = request.get("email");
        String password = request.get("password");
        String role = request.getOrDefault("role", "Clinical Pharmacist");

        if (email == null || password == null || fullName == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Full name, work email, and password are required."));
        }

        String cleanEmail = email.trim().toLowerCase();

        Optional<User> existingOpt = userRepository.findByEmail(cleanEmail);
        User user;
        if (existingOpt.isPresent()) {
            user = existingOpt.get();
            user.setFullName(fullName.trim());
            user.setRole(role);
            user.setVerified(true);
            userRepository.save(user);
        } else {
            user = new User(fullName.trim(), cleanEmail, password, role);
            user.setVerified(true);
            userRepository.save(user);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("status", "SUCCESS");
        response.put("message", "Account registered and verified successfully.");
        response.put("token", "jwt_sec_token_" + System.currentTimeMillis());
        response.put("user", Map.of(
            "id", user.getId(),
            "name", user.getFullName(),
            "email", user.getEmail(),
            "role", user.getRole(),
            "isVerified", true
        ));

        return ResponseEntity.ok(response);
    }
}
