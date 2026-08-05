package com.finalproject.studentprogresstracker.config;

import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI studentProgressTrackerAPI() {

        return new OpenAPI()
                .info(new Info()
                        .title("Training Institute Management System API")
                        .description("REST APIs for Student and Trainer Dashboard")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Team TIMS")
                                .email("support@tims.com"))
                        .license(new License()
                                .name("Apache 2.0")))
                .externalDocs(new ExternalDocumentation()
                        .description("Project Documentation"));
    }
}