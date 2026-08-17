package com.example.SPT.security;

import java.util.List;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.example.SPT.entity.User;
import com.example.SPT.repository.UserRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        if (email == null || email.isBlank()) {
            throw new UsernameNotFoundException("Email cannot be empty");
        }

        List<User> users = userRepository.findAllByEmail(email.trim());

        if (users.isEmpty()) {
            return userRepository.findByEmail(email.trim())
                    .orElseThrow(() -> new UsernameNotFoundException("User not found for email: " + email));
        }

        // Prioritize enabled users with active roles
        return users.stream()
                .filter(u -> Boolean.TRUE.equals(u.getEnabled()) && u.getRole() != null)
                .findFirst()
                .orElse(users.get(0));
    }

}
