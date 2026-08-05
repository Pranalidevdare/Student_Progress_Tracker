package com.example.SPT.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.example.SPT.entity.Batch;
import com.example.SPT.enums.BatchStatus;


@Repository
public interface BatchRepository extends MongoRepository<Batch, String> {

    long countByStatus(BatchStatus status);

}