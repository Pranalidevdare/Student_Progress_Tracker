package com.example.SPT.dto.request;

import com.example.SPT.enums.Role;
import com.example.SPT.enums.TrainerType;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @Email(message = "Enter a valid email")
    @NotBlank(message = "Email is required")
    private String email;

    @Size(min = 8, message = "Password must contain at least 8 characters")
    private String password;

    @Pattern(
        regexp = "^[6-9]\\d{9}$",
        message = "Enter a valid 10-digit mobile number"
    )
    private String phone;

    private Role role;

    private TrainerType trainerType;

}