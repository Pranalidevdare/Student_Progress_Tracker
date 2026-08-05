package com.finalproject.studentprogresstracker.service;

import com.finalproject.studentprogresstracker.dto.InterviewAssesementRequest;
import com.finalproject.studentprogresstracker.dto.InterviewAssesementResponse;
import com.finalproject.studentprogresstracker.entity.Interview;
import com.finalproject.studentprogresstracker.mapper.InterviewAssessmentMapper;
import com.finalproject.studentprogresstracker.repository.InterviewAssesementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InterviewAssesementService {

    private final InterviewAssesementRepository repository;
    private final InterviewAssessmentMapper mapper;

    // Add Interview Assessment
    public InterviewAssesementResponse addInterviewAssessment(
            Interview interviewAssessment) {

        calculateMarks(interviewAssessment);

        Interview saved = repository.save(interviewAssessment);

        return mapper.toDto(saved);
    }

    // Get All
    public List<InterviewAssesementResponse> getAllAssessments() {

        return repository.findAll()
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    // Get By Id
    public InterviewAssesementResponse getAssessmentById(String assessmentId) {

        Interview assessment = repository.findById(assessmentId)
                .orElseThrow(() ->
                        new RuntimeException("Interview Assessment Not Found"));

        return mapper.toDto(assessment);
    }

    // Update
    public InterviewAssesementResponse updateAssessment(
            String assessmentId,
            InterviewAssesementRequest dto) {

        Interview assessment = repository.findById(assessmentId)
                .orElseThrow(() ->
                        new RuntimeException("Interview Assessment Not Found"));

        // Aptitude
        assessment.setAptitude(dto.getAptitude());
        assessment.setMathematics(dto.getMathematics());
        assessment.setReasoning(dto.getReasoning());
        assessment.setComputerKnowledge(dto.getComputerKnowledge());

        // Technical
        assessment.setTechnicalPanelist(dto.getTechnicalPanelist());
        assessment.setTechnicalAssessment(dto.getTechnicalAssessment());
        assessment.setStability(dto.getStability());
        assessment.setTechnicalRemarks(dto.getTechnicalRemarks());
        assessment.setTechnicalStatus(dto.getTechnicalStatus());

        // Soft Skills
        assessment.setSoftSkillPanelist(dto.getSoftSkillPanelist());
        assessment.setWarmUp(dto.getWarmUp());
        assessment.setSpeaking(dto.getSpeaking());
        assessment.setListening(dto.getListening());
        assessment.setGrammar(dto.getGrammar());
        assessment.setVocabulary(dto.getVocabulary());
        assessment.setGuidedSpeaking(dto.getGuidedSpeaking());

        assessment.setRemarks(dto.getRemarks());

        calculateMarks(assessment);

        Interview updated = repository.save(assessment);

        return mapper.toDto(updated);
    }

    // Delete
    public String deleteAssessment(String assessmentId) {

        repository.deleteById(assessmentId);

        return "Interview Assessment Deleted Successfully";
    }

    // Get By Candidate
    public List<InterviewAssesementResponse> getByCandidate(String candidateId) {

        return repository.findByCandidateId(candidateId)
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    // Get By Trainer
    public List<InterviewAssesementResponse> getByTrainer(String trainerId) {

        return repository.findByTrainerId(trainerId)
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    // Get Selected Students
    public List<InterviewAssesementResponse> getSelectedStudents() {

        return repository.findByFinalStatus("SELECTED")
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    // ===========================
    // Calculate Marks
    // ===========================

    private void calculateMarks(Interview assessment) {

        int aptitudeTotal =
                value(assessment.getAptitude()) +
                value(assessment.getMathematics()) +
                value(assessment.getReasoning()) +
                value(assessment.getComputerKnowledge());

        assessment.setAptitudeTotal(aptitudeTotal);

        int softSkillTotal =
                value(assessment.getWarmUp()) +
                value(assessment.getSpeaking()) +
                value(assessment.getListening()) +
                value(assessment.getGrammar()) +
                value(assessment.getVocabulary()) +
                value(assessment.getGuidedSpeaking());

        assessment.setSoftSkillTotal(softSkillTotal);

        int overall = aptitudeTotal + softSkillTotal;

        assessment.setOverallScore(overall);

        if (overall >= 60 &&
                "PASS".equalsIgnoreCase(assessment.getTechnicalStatus())) {

            assessment.setFinalStatus("SELECTED");

        } else {

            assessment.setFinalStatus("REJECTED");
        }
    }

    private int value(Integer marks) {
        return marks == null ? 0 : marks;
    }

}