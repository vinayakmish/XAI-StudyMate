package com.xaistudymate.backend.controller;

import com.xaistudymate.backend.dto.auth.AuthResponse;
import com.xaistudymate.backend.dto.auth.LoginRequest;
import com.xaistudymate.backend.dto.auth.RegisterRequest;
import com.xaistudymate.backend.entity.User;
import com.xaistudymate.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = authService.getUserByEmail(userDetails.getUsername());
        Map<String, Object> result = new java.util.LinkedHashMap<>();
        result.put("id", user.getId());
        result.put("email", user.getEmail());
        result.put("fullName", user.getFullName());
        result.put("role", user.getRole().name());
        result.put("phone", user.getPhone());
        result.put("university", user.getUniversity());
        result.put("yearOfStudy", user.getYearOfStudy());
        result.put("bio", user.getBio());
        result.put("profilePicture", user.getProfilePicture());
        return ResponseEntity.ok(result);
    }

    @PutMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> body) {
        User user = authService.getUserByEmail(userDetails.getUsername());
        if (body.containsKey("fullName")) user.setFullName(body.get("fullName"));
        if (body.containsKey("phone")) user.setPhone(body.get("phone"));
        if (body.containsKey("university")) user.setUniversity(body.get("university"));
        if (body.containsKey("yearOfStudy")) user.setYearOfStudy(body.get("yearOfStudy"));
        if (body.containsKey("bio")) user.setBio(body.get("bio"));
        if (body.containsKey("profilePicture")) user.setProfilePicture(body.get("profilePicture"));
        authService.saveUser(user);
        Map<String, Object> result = new java.util.LinkedHashMap<>();
        result.put("id", user.getId());
        result.put("email", user.getEmail());
        result.put("fullName", user.getFullName());
        result.put("phone", user.getPhone());
        result.put("university", user.getUniversity());
        result.put("yearOfStudy", user.getYearOfStudy());
        result.put("bio", user.getBio());
        result.put("profilePicture", user.getProfilePicture());
        return ResponseEntity.ok(result);
    }
}
