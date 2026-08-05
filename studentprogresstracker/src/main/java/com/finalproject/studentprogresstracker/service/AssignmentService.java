package com.finalproject.studentprogresstracker.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.finalproject.studentprogresstracker.entity.Assignment;
import com.finalproject.studentprogresstracker.repository.AssignmentRepository;

@Service
public class AssignmentService {

    @Autowired
    private AssignmentRepository assignmentRepository;

    // Add Assignment
    public Assignment addAssignment(Assignment assignment) {

        assignment.setAssignedDate(LocalDate.now());
        assignment.setStatus("ASSIGNED");

        return assignmentRepository.save(assignment);
    }

    // Get All Assignments
    public List<Assignment> getAllAssignments() {

        return assignmentRepository.findAll();
    }

    // Get Assignment By Id
    public Assignment getAssignmentById(String assignmentId) {

        return assignmentRepository.findById(assignmentId)
                .orElseThrow(() ->
                        new RuntimeException("Assignment not found"));
    }

    // Get Assignment By Trainer
    public List<Assignment> getAssignmentByTrainer(String trainerId) {

        return assignmentRepository.findByTrainerId(trainerId);
    }

    // Get Assignment By Batch
    public List<Assignment> getAssignmentByBatch(String batchId) {

        return assignmentRepository.findByBatchId(batchId);
    }

    // Get Assignment By Status
    public List<Assignment> getAssignmentByStatus(String status) {

        return assignmentRepository.findByStatus(status);
    }

    // Update Assignment
    public Assignment updateAssignment(String assignmentId,
                                       Assignment assignment) {

        Assignment existing = assignmentRepository.findById(assignmentId)
                .orElseThrow(() ->
                        new RuntimeException("Assignment not found"));

        existing.setTitle(assignment.getTitle());
        existing.setDescription(assignment.getDescription());
        existing.setAssignedDate(assignment.getAssignedDate());
        existing.setDueDate(assignment.getDueDate());
        existing.setBatchId(assignment.getBatchId());
        existing.setTrainerId(assignment.getTrainerId());
        existing.setStatus(assignment.getStatus());

        return assignmentRepository.save(existing);
    }

    // Delete Assignment
    public String deleteAssignment(String assignmentId) {

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() ->
                        new RuntimeException("Assignment not found"));

        assignmentRepository.delete(assignment);

        return "Assignment Deleted Successfully";
    }

}