package com.example.SPT.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.example.SPT.entity.Application;
import com.example.SPT.enums.ApplicationStatus;

@Repository
public interface ApplicationRepository extends MongoRepository<Application, String> {

    // Validation

    boolean existsByEmail(String email);

    boolean existsByMobile(String mobile);

    boolean existsByApplicationNumber(String applicationNumber);

    // Find

    Optional<Application> findByEmail(String email);

    Optional<Application> findByApplicationNumber(String applicationNumber);

    // Dashboard

    long countByStatus(ApplicationStatus status);

    List<Application> findByStatus(ApplicationStatus status);

    List<Application> findByCollegeName(String collegeName);

    List<Application> findByBranch(String branch);

    List<Application> findByYearOfStudy(String yearOfStudy);

    // Search

    List<Application> findByFullNameContainingIgnoreCase(String fullName);

    List<Application> findByCollegeNameContainingIgnoreCase(String collegeName);

    List<Application> findByBranchContainingIgnoreCase(String branch);

}