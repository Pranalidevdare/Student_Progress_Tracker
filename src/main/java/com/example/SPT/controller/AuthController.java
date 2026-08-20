package com.example.SPT.controller;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.SPT.dto.request.LoginRequest;
import com.example.SPT.dto.request.RegisterRequest;
import com.example.SPT.dto.response.AuthResponse;
import com.example.SPT.service.AuthService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request) {

        AuthResponse response = authService.register(request);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request) {

        AuthResponse response = authService.login(request);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/change-password")
    public ResponseEntity<AuthResponse> changePassword(
            @Valid @RequestBody com.example.SPT.dto.request.PasswordChangeRequest request,
            java.security.Principal principal) {

        String email = request.getEmail();
        if ((email == null || email.isBlank()) && principal != null) {
            email = principal.getName();
        }

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("User email is required for password change");
        }

        AuthResponse response = authService.changePassword(
                email,
                request.getCurrentPassword(),
                request.getNewPassword());

        return ResponseEntity.ok(response);
    }
}