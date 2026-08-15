package com.example.SPT.dto.response;

import com.example.SPT.enums.Role;
import com.example.SPT.enums.TrainerType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AuthResponse {

    private String id;

    private String token;

    private String type = "Bearer";

    private String message;

    private String email;

    private String fullName;

    private Role role;

    private TrainerType trainerType;

}