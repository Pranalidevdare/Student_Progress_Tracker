package com.example.SPT.service;

import com.example.SPT.dto.request.LoginRequest;
import com.example.SPT.dto.request.RegisterRequest;
import com.example.SPT.dto.response.AuthResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse changePassword(String email, String currentPassword, String newPassword);
}