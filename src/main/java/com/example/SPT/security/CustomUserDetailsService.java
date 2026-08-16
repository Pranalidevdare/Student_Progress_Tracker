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

        List<User> users = userRepository.findAllByEmail(email);

        if (users.isEmpty()) {
            throw new UsernameNotFoundException("User not found");
        }

        if (users.size() > 1) {
            throw new UsernameNotFoundException("Multiple user records found for this email");
        }

        return users.get(0);
    }

}
