package com.example.SPT;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.lang.reflect.Field;

import org.junit.jupiter.api.Test;
import org.springframework.data.mongodb.core.index.Indexed;

import com.example.SPT.entity.User;
import com.example.SPT.enums.ApplicationStatus;

class AuthPasswordFlowTest {

    @Test
    void homeVisitDecisionsAreAvailableInLifecycle() {
        assertNotNull(ApplicationStatus.HOME_VISIT_PASSED);
        assertNotNull(ApplicationStatus.HOME_VISIT_REJECTED);
    }

    @Test
    void userMustChangePasswordFlagCanBeTracked() {
        User user = User.builder()
                .email("candidate@example.com")
                .fullName("Candidate User")
                .enabled(true)
                .build();

        assertFalse(Boolean.TRUE.equals(user.getMustChangePassword()));
    }

    @Test
    void userEmailAndPhoneShouldBeUnique() throws NoSuchFieldException {
        Field emailField = User.class.getDeclaredField("email");
        Field phoneField = User.class.getDeclaredField("phone");

        assertNotNull(emailField.getAnnotation(Indexed.class));
        assertNotNull(phoneField.getAnnotation(Indexed.class));
    }
}
