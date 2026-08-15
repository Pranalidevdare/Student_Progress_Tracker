package com.example.SPT.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.example.SPT.entity.Student;

@Repository
public interface StudentRepository extends MongoRepository<Student, String> {

    Optional<Student> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<Student> findByMobile(String mobile);

    Optional<Student> findByStudentId(String studentId);

    long countByBatchId(String batchId);
}