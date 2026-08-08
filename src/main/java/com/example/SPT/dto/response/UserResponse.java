package com.example.SPT.dto.response;

import com.example.SPT.enums.Role;
import com.example.SPT.enums.TrainerType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private String id;

    private String fullName;

    private String email;

    private String phone;

    private Role role;

    private TrainerType trainerType;

    private boolean enabled;

}

