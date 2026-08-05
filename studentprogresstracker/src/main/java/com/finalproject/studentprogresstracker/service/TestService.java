package com.finalproject.studentprogresstracker.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.finalproject.studentprogresstracker.entity.Test;
import com.finalproject.studentprogresstracker.repository.TestRepository;

@Service
public class TestService {

    @Autowired
    private TestRepository testRepository;

    // Create Test
    public Test createTest(Test test) {

        return testRepository.save(test);
    }

    // Get All Tests
    public List<Test> getAllTests() {

        return testRepository.findAll();
    }

    // Get Test By Id
    public Test getTestById(String testId) {

        return testRepository.findById(testId)
                .orElseThrow(() ->
                        new RuntimeException("Test Not Found"));
    }

    // Get Tests By Trainer
    public List<Test> getTestsByTrainer(String trainerId) {

        return testRepository.findByTrainerId(trainerId);
    }

    // Get Tests By Batch
    public List<Test> getTestsByBatch(String batchId) {

        return testRepository.findByBatchId(batchId);
    }

    // Update Test
    public Test updateTest(String testId, Test test) {

        Test existingTest = testRepository.findById(testId)
                .orElseThrow(() ->
                        new RuntimeException("Test Not Found"));

        existingTest.setTrainerId(test.getTrainerId());
        existingTest.setBatchId(test.getBatchId());
        existingTest.setTestTitle(test.getTestTitle());
        existingTest.setTestDate(test.getTestDate());
        existingTest.setDuration(test.getDuration());
        existingTest.setTotalMarks(test.getTotalMarks());

        return testRepository.save(existingTest);
    }

    // Delete Test
    public String deleteTest(String testId) {

        Test test = testRepository.findById(testId)
                .orElseThrow(() ->
                        new RuntimeException("Test Not Found"));

        testRepository.delete(test);

        return "Test Deleted Successfully";
    }

}