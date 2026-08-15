package com.example.SPT.exception;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import lombok.extern.slf4j.Slf4j;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {


    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(BadCredentialsException ex) {

        ErrorResponse response = new ErrorResponse(
                HttpStatus.UNAUTHORIZED.value(),
                "Invalid Email or Password",
                LocalDateTime.now());

        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(
            MethodArgumentNotValidException ex) {

        Map<String, String> errors = new HashMap<>();

        ex.getBindingResult()
          .getAllErrors()
          .forEach(error -> {

              String field = ((FieldError) error).getField();

              String message = error.getDefaultMessage();

              errors.put(field, message);

          });

        return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex) {
        ErrorResponse response = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                ex.getMessage(),
                LocalDateTime.now());
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(org.springframework.security.access.AccessDeniedException ex) {
        ErrorResponse response = new ErrorResponse(
                HttpStatus.FORBIDDEN.value(),
                ex.getMessage(),
                LocalDateTime.now());
        return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception ex) {
        log.error("Unhandled Exception caught in GlobalExceptionHandler: {}", ex.getMessage(), ex);

        ErrorResponse response = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                ex.getMessage() != null ? ex.getMessage() : "Something went wrong",
                LocalDateTime.now());

        return new ResponseEntity<>(response,
                HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
 
        @ExceptionHandler(ResourceNotFoundException.class)
        public ResponseEntity<ErrorResponse> handleResourceNotFound(
                ResourceNotFoundException ex) {

            ErrorResponse error = new ErrorResponse(
                    HttpStatus.NOT_FOUND.value(),
                    ex.getMessage(),
                    LocalDateTime.now());

            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        }
        
        @ExceptionHandler(AccountDisabledException.class)
        public ResponseEntity<ErrorResponse> handleAccountDisabled(
                AccountDisabledException ex) {

            ErrorResponse response = new ErrorResponse(
                    HttpStatus.FORBIDDEN.value(),
                    ex.getMessage(),
                    LocalDateTime.now());

            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }
        
        @ExceptionHandler(DuplicateResourceException.class)
        public ResponseEntity<ErrorResponse> handleDuplicateResource(
                DuplicateResourceException ex) {

            ErrorResponse response = new ErrorResponse(
                    HttpStatus.CONFLICT.value(),
                    ex.getMessage(),
                    LocalDateTime.now());

            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }
        
        @ExceptionHandler(ResourceAlreadyExistsException.class)
        public ResponseEntity<ErrorResponse> handleResourceAlreadyExists(
                ResourceAlreadyExistsException ex) {

            ErrorResponse error = new ErrorResponse(
                    HttpStatus.CONFLICT.value(),
                    ex.getMessage(),
                    LocalDateTime.now());

            return new ResponseEntity<>(error, HttpStatus.CONFLICT);
        }

    

}