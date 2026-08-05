package com.finalproject.studentprogresstracker.repository;

import com.finalproject.studentprogresstracker.entity.Student;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for Student entity.
 *
 * Handles database operations related to Student profile.
 */
@Repository
public interface StudentRepository extends MongoRepository<Student, String> {

    /**
     * Find student by Student ID.
     *
     * @param studentId institute student id
     * @return Optional<Student>
     */
    Optional<Student> findByStudentId(String studentId);

    /**
     * Find student by email.
     *
     * Used while fetching profile after authentication.
     *
     * @param email student's email
     * @return Optional<Student>
     */
    Optional<Student> findByEmail(String email);

    /**
     * Checks whether Student ID already exists.
     *
     * @param studentId institute student id
     * @return true if exists
     */
    boolean existsByStudentId(String studentId);

    /**
     * Checks whether email already exists.
     *
     * @param email student email
     * @return true if exists
     */
    boolean existsByEmail(String email);
}