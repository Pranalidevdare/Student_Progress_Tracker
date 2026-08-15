package com.example.SPT.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.example.SPT.security.JwtAuthenticationFilter;
import java.util.List;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;


@Configuration
public class SecurityConfig {

    private final UserDetailsService userDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            UserDetailsService userDetailsService,
            JwtAuthenticationFilter jwtAuthenticationFilter) {

        this.userDetailsService = userDetailsService;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {

        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider();

        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());

        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration)
            throws Exception {

        return configuration.getAuthenticationManager();
    }
    
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOriginPatterns(List.of("*"));

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                List.of(
                        "Authorization",
                        "Content-Type",
                        "Accept",
                        "X-Requested-With",
                        "Access-Control-Request-Method",
                        "Access-Control-Request-Headers"
                )
        );

        configuration.setExposedHeaders(
                List.of("Authorization")
        );

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }
    

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

    	http
        .csrf(csrf -> csrf.disable())

        .cors(cors -> cors.configurationSource(
                corsConfigurationSource()
        ))

        .sessionManagement(session ->
                session.sessionCreationPolicy(
                        SessionCreationPolicy.STATELESS))

            .authenticationProvider(authenticationProvider())

            .addFilterBefore(
                    jwtAuthenticationFilter,
                    UsernamePasswordAuthenticationFilter.class)

            .authorizeHttpRequests(auth -> auth

                // Preflight OPTIONS requests
                .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()

                // ==========================================
                // PUBLIC APIs
                // ==========================================
                .requestMatchers(
                        "/api/auth/**",
                        "/auth/**",
                        "/api/applications/**",
                        "/api/aptitude/**",
                        "/api/documentation/**",
                        "/api/documentations/**",
                        "/uploads/**",
                        "/swagger-ui/**",
                        "/swagger-ui.html",
                        "/v3/api-docs/**",
                        "/error"
                ).permitAll()

                .requestMatchers("/api/auth/change-password")
                .authenticated()

                // ==========================================
                // BATCH APIs
                // ==========================================
                .requestMatchers("/api/batches/**")
                .hasAnyRole("ADMIN", "TRAINER", "STUDENT")

                // ==========================================
                // ADMIN APIs
                // ==========================================
                .requestMatchers("/api/admin/seed-database")
                .permitAll()
                
                .requestMatchers("/api/admin/**")
                .hasRole("ADMIN")

                // ==========================================
                // TRAINER APIs
                // ==========================================
                .requestMatchers("/api/trainer/**", "/api/trainers/**")
                .hasAnyRole("TRAINER", "ADMIN")

                // ==========================================
                // STUDENT APIs
                // ==========================================
                .requestMatchers("/api/student/**", "/api/students/**")
                .hasAnyRole("STUDENT", "TRAINER", "ADMIN")

                // ==========================================
                // SELECTION APIs
                // ==========================================
                .requestMatchers("/api/selection/**")
                .hasAnyRole("ADMIN", "TRAINER")

                // ==========================================
                // EVERYTHING ELSE
                // ==========================================
                .anyRequest()
                .authenticated()
            );

        return http.build();
    }
}