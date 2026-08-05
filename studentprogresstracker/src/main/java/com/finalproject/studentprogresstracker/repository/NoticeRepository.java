package com.finalproject.studentprogresstracker.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.finalproject.studentprogresstracker.entity.Notice;

@Repository
public interface NoticeRepository extends MongoRepository<Notice, String> {

    List<Notice> findByTrainerId(String trainerId);

}