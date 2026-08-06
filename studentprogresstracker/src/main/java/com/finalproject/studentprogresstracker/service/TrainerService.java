package com.finalproject.studentprogresstracker.service;

import java.util.List;

import com.finalproject.studentprogresstracker.dto.request.TrainerRequest;
import com.finalproject.studentprogresstracker.dto.response.TrainerDashboardResponse;
import com.finalproject.studentprogresstracker.dto.response.TrainerResponse;

public interface TrainerService {

    TrainerResponse registerTrainer(TrainerRequest request);

    TrainerResponse getTrainerById(String id);

    List<TrainerResponse> getAllTrainers();

    TrainerResponse updateTrainer(String id, TrainerRequest request);

    void deleteTrainer(String id);

    TrainerDashboardResponse getTrainerDashboard(String trainerId);

}