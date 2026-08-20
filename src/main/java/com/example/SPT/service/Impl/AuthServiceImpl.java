package com.example.SPT.service.Impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

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

import com.example.SPT.enums.Role;
import com.example.SPT.entity.Student;
import com.example.SPT.repository.StudentRepository;
import java.util.Optional;

@Service
public class AuthServiceImpl implements AuthService {

	private final AuthenticationManager authenticationManager;
	private final JwtService jwtService;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthServiceImpl(UserRepository userRepository,
            StudentRepository studentRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
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
                .id(user.getId())
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

        List<User> users = userRepository.findAllByEmail(request.getEmail());

        if (users.size() > 1) {
            throw new BadCredentialsException("Multiple user accounts found for this email");
        }

        User user = users.stream().findFirst()
                .orElseThrow(() -> new BadCredentialsException("Invalid Email or Password"));

        if (!user.isEnabled()) {
            throw new AccountDisabledException(
                    "Your account has been disabled. Please contact the administrator.");
        }

        boolean mustChangePassword = Boolean.TRUE.equals(user.getMustChangePassword());
        String token = jwtService.generateToken(user.getEmail(), mustChangePassword);

        String resolvedId = user.getId();
        String resolvedStudentId = null;

        if ((user.getRole() == Role.STUDENT || "STUDENT".equalsIgnoreCase(String.valueOf(user.getRole()))) && studentRepository != null) {
            Optional<Student> sOpt = studentRepository.findByEmail(user.getEmail());
            if (!sOpt.isPresent() && user.getEmail() != null) {
                sOpt = studentRepository.findByEmail(user.getEmail().toLowerCase());
            }
            if (sOpt.isPresent()) {
                Student s = sOpt.get();
                resolvedId = s.getId();
                resolvedStudentId = s.getStudentId();
            }
        }

        return AuthResponse.builder()
                .id(user.getId())
                .token(token)
                .message(mustChangePassword ? "Password change required" : "Login Successful")
                .id(resolvedId)
                .studentId(resolvedStudentId)
                .mustChangePassword(mustChangePassword)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .trainerType(user.getTrainerType())
                .mustChangePassword(mustChangePassword)
                .build();
    }

    @Override
    public AuthResponse changePassword(String email, String currentPassword, String newPassword) {
        List<User> users = userRepository.findAllByEmail(email);

        if (users.size() > 1) {
            throw new BadCredentialsException("Multiple user accounts found for this email");
        }

        User user = users.stream().findFirst()
                .orElseThrow(() -> new BadCredentialsException("User not found"));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new BadCredentialsException("Current password is incorrect");
        }

        if (newPassword == null || newPassword.trim().length() < 8) {
            throw new IllegalArgumentException("New password must be at least 8 characters long");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setMustChangePassword(false);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        return AuthResponse.builder()
                .message("Password changed successfully")
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .trainerType(user.getTrainerType())
                .mustChangePassword(false)
                .build();
    }

    public String generateTemporaryPassword() {
        return "Temp@" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

}
