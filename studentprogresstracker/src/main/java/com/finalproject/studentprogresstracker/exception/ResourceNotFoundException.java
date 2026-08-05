package com.finalproject.studentprogresstracker.exception;

/**
 * Custom exception thrown when a requested resource
 * is not found in the database.
 */
public class ResourceNotFoundException extends RuntimeException {

    /**
     * Constructor with custom message.
     *
     * @param message Exception message
     */
    public ResourceNotFoundException(String message) {
        super(message);
    }

    /**
     * Constructor with custom message and cause.
     *
     * @param message Exception message
     * @param cause Root cause
     */
    public ResourceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}