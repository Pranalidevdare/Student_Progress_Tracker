package com.example.SPT.service.Impl;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.example.SPT.dto.request.InterviewRequest;
import com.example.SPT.dto.response.InterviewResponse;
import com.example.SPT.entity.Interview;
import com.example.SPT.mapper.InterviewMapper;
import com.example.SPT.repository.InterviewRepository;
import com.example.SPT.service.InterviewService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class InterviewServiceImpl implements InterviewService {

    private final InterviewRepository interviewRepository;

    private final InterviewMapper interviewMapper;

    @Override
    public InterviewResponse conductInterview(InterviewRequest request) {

        Interview interview = Interview.builder()
                .studentId(request.getStudentId())
                .trainerId(request.getTrainerId())
                .batchId(request.getBatchId())
                .interviewDate(request.getInterviewDate())
                .interviewType(request.getInterviewType())
                .technicalMarks(request.getTechnicalMarks())
                .softSkillMarks(request.getSoftSkillMarks())
                .communicationMarks(request.getCommunicationMarks())
                .problemSolvingMarks(request.getProblemSolvingMarks())
                .behaviourMarks(request.getBehaviourMarks())
                .totalMarks(request.getTotalMarks())
                .remarks(request.getRemarks())
                .status(request.getStatus())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Interview savedInterview = interviewRepository.save(interview);

        return interviewMapper.toResponse(savedInterview);
    }

    @Override
    public InterviewResponse updateInterview(String id, InterviewRequest request) {

        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Interview not found with id : " + id));

        interview.setStudentId(request.getStudentId());
        interview.setTrainerId(request.getTrainerId());
        interview.setBatchId(request.getBatchId());
        interview.setInterviewDate(request.getInterviewDate());
        interview.setInterviewType(request.getInterviewType());
        interview.setTechnicalMarks(request.getTechnicalMarks());
        interview.setSoftSkillMarks(request.getSoftSkillMarks());
        interview.setCommunicationMarks(request.getCommunicationMarks());
        interview.setProblemSolvingMarks(request.getProblemSolvingMarks());
        interview.setBehaviourMarks(request.getBehaviourMarks());
        interview.setTotalMarks(request.getTotalMarks());
        interview.setRemarks(request.getRemarks());
        interview.setStatus(request.getStatus());
        interview.setUpdatedAt(LocalDateTime.now());

        Interview updatedInterview = interviewRepository.save(interview);

        return interviewMapper.toResponse(updatedInterview);
    }

    @Override
    public InterviewResponse getInterviewByStudent(String studentId) {

        Interview interview = interviewRepository.findByStudentId(studentId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Interview not found for student id : " + studentId));

        return interviewMapper.toResponse(interview);
    }

}