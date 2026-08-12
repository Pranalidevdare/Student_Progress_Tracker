package com.example.SPT.dto.request;


import com.example.SPT.enums.TrainerType;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTrainerRequest {

    @NotBlank(message = "Full Name is required")
    private String fullName;

    @Email(message = "Invalid Email")
    private String email;

    @Pattern(
            regexp = "^[6-9]\\d{9}$",
            message = "Invalid Phone Number"
    )
    private String phone;

    private TrainerType trainerType;
}