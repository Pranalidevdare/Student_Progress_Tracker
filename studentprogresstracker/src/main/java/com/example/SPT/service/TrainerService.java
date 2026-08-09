package com.example.SPT.service;

import java.util.List;

import com.example.SPT.dto.request.TrainerRequest;
import com.example.SPT.dto.response.TrainerDashboardResponse;
import com.example.SPT.dto.response.TrainerResponse;

public interface TrainerService {

    TrainerResponse registerTrainer(TrainerRequest request);

    TrainerResponse getTrainerById(String id);

    List<TrainerResponse> getAllTrainers();

    TrainerResponse updateTrainer(String id, TrainerRequest request);

    void deleteTrainer(String id);

    TrainerDashboardResponse getTrainerDashboard(String trainerId);

}