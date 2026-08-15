package com.example.SPT.service.Impl;

import java.time.LocalDateTime;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.SPT.dto.request.LoginRequest;
import com.example.SPT.dto.request.RegisterRequest;
import com.example.SPT.dto.response.AuthResponse;
import com.example.SPT.entity.User;
import com.example.SPT.exception.AccountDisabledException;
import com.example.SPT.repository.UserRepository;
import com.example.SPT.security.JwtService;
import com.example.SPT.service.AuthService;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import com.example.SPT.security.JwtService;

@Service
public class AuthServiceImpl implements AuthService {

	
	private final AuthenticationManager authenticationManager;
	private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthServiceImpl(UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService) {

this.userRepository = userRepository;
this.passwordEncoder = passwordEncoder;
this.authenticationManager = authenticationManager;
this.jwtService = jwtService;
}

    @Override
    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists.");
        }

        if (userRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException("Phone number already exists.");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(request.getRole())
                .trainerType(request.getTrainerType())
                .enabled(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        userRepository.save(user);

        return AuthResponse.builder()
                .id(user.getId())
                .message("Registration Successful")
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .trainerType(user.getTrainerType())
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                new BadCredentialsException("Invalid Email or Password"));

        
        if (!user.isEnabled()) {
            throw new AccountDisabledException(
                    "Your account has been disabled. Please contact the administrator.");
        }

        String token = jwtService.generateToken(user.getEmail());

        return AuthResponse.builder()
                .id(user.getId())
                .token(token)
                .message("Login Successful")
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .trainerType(user.getTrainerType())
                .build();
    }

}
