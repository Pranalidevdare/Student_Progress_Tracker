package com.example.SPT.entity;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "aptitude_questions")
public class AptitudeQuestion {

    @Id
    private String id;

    /*
     * Question text
     */
    private String question;

    /*
     * Multiple choice options
     */
    private String optionA;

    private String optionB;

    private String optionC;

    private String optionD;

    /*
     * Correct option
     *
     * Store only:
     * A
     * B
     * C
     * D
     */
    private String correctAnswer;

    /*
     * Question category
     *
     * Examples:
     * ENGLISH
     * APTITUDE
     * COMPUTER
     * LOGICAL_REASONING
     */
    private String category;

    /*
     * Marks awarded for correct answer
     */
    private Integer marks;

    /*
     * Whether question is available for quiz
     */
    private Boolean active;

    /*
     * Audit fields
     */
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}