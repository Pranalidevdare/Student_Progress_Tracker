package com.example.SPT.service;

import java.time.LocalDate;

import org.springframework.stereotype.Service;

import com.example.SPT.dto.response.AdminDashboardResponse;
import com.example.SPT.enums.ApplicationStatus;
import com.example.SPT.enums.BatchStatus;
import com.example.SPT.enums.Role;
import com.example.SPT.enums.TrainerType;
import com.example.SPT.repository.ApplicationRepository;
import com.example.SPT.repository.AttendanceRepository;
import com.example.SPT.repository.BatchRepository;
import com.example.SPT.repository.InterviewRepository;
import com.example.SPT.repository.UserRepository;

import lombok.RequiredArgsConstructor;
@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final UserRepository userRepository;
    private final BatchRepository batchRepository;
    private final ApplicationRepository applicationRepository;
    private final InterviewRepository interviewRepository;
    private final AttendanceRepository attendanceRepository;

    public AdminDashboardResponse getDashboard() {

        return AdminDashboardResponse.builder()

                .totalStudents(
                        userRepository.countByRole(Role.STUDENT)
                )

                .totalTechnicalTrainers(
                        userRepository.countByRoleAndTrainerType(
                                Role.TRAINER,
                                TrainerType.TECHNICAL
                        )
                )

                .totalSoftSkillTrainers(
                        userRepository.countByRoleAndTrainerType(
                                Role.TRAINER,
                                TrainerType.SOFT_SKILLS
                        )
                )

                .totalAdmins(
                        userRepository.countByRole(Role.ADMIN)
                )

                .totalUsers(
                        userRepository.count()
                )

                .totalBatches(
                        batchRepository.count()
                )

                .activeBatches(
                        batchRepository.countByStatus(
                                BatchStatus.ACTIVE
                        )
                )

                .completedBatches(
                        batchRepository.countByStatus(
                                BatchStatus.COMPLETED
                        )
                )

                .pendingApplications(
                        applicationRepository.countByStatus(
                                ApplicationStatus.SUBMITTED
                        )
                )

                .shortlistedStudents(
                        applicationRepository.countByStatus(
                                ApplicationStatus.APTITUDE_PASSED
                        )
                )

                .technicalInterviewPending(
                        interviewRepository.countByInterviewTypeAndStatus(
                                "TECHNICAL",
                                "SCHEDULED"
                        )
                )

                .hrInterviewPending(
                        interviewRepository.countByInterviewTypeAndStatus(
                                "HR",
                                "SCHEDULED"
                        )
                )

                .homeVisitPending(
                        applicationRepository.countByStatus(
                                ApplicationStatus.HOME_VISIT_PENDING
                        )
                )

                .documentsPending(
                        applicationRepository.countByStatus(
                                ApplicationStatus.DOCUMENTATION_PENDING
                        )
                )

                .selectedStudents(
                        applicationRepository.countByStatus(
                                ApplicationStatus.SELECTED
                        )
                )
                .totalTrainers(
                        userRepository.countByRole(Role.TRAINER)
                )
                
                .totalApplications(
                        applicationRepository.count()
                )

                .rejectedStudents(
                        applicationRepository.countByStatus(
                                ApplicationStatus.REJECTED
                        )
                )

                .todayAttendance(
                        attendanceRepository.countByAttendanceDate(
                                LocalDate.now()
                        )
                )

                .build();
    }
}