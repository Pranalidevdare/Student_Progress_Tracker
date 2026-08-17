package com.example.SPT.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.example.SPT.entity.Student;

@Repository
public interface StudentRepository extends MongoRepository<Student, String> {

    Optional<Student> findByEmail(String email);

    List<Student> findAllByEmail(String email);

    boolean existsByEmail(String email);

    Optional<Student> findByMobile(String mobile);

    List<Student> findAllByMobile(String mobile);

    Optional<Student> findByStudentId(String studentId);

    List<Student> findAllByStudentId(String studentId);

    long countByBatchId(String batchId);

    List<Student> findByBatchId(String batchId);
}