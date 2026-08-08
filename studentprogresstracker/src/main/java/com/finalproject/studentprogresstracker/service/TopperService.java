package com.finalproject.studentprogresstracker.service;

import java.util.List;

import com.finalproject.studentprogresstracker.dto.response.TopperResponse;

public interface TopperService {

    // Get top performers of all batches
    List<TopperResponse> getAllToppers();

    // Get toppers of a particular batch
    List<TopperResponse> getToppersByBatch(String batchId);

    // Get Top N toppers
    List<TopperResponse> getTopRankers(int limit);

}