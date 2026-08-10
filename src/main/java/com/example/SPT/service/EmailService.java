package com.example.SPT.service;

import java.time.LocalDateTime;

import com.example.SPT.entity.AptitudeSchedule;

public interface EmailService {

	void sendAptitudeScheduleEmail(
	        String to,
	        String studentName,
	        AptitudeSchedule schedule);
}