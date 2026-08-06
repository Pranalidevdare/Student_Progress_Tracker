package com.example.SPT.dto.response;

import com.example.SPT.enums.Role;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentResponse {
	
	private String id;
	
	private String fullName;
	
	private String email;
	
	private String phone;
	
	private Role role;
	
	private boolean enabled;

}
