package com.example.SPT.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;



@Repository
public interface BatchRepository extends MongoRepository<Batch, String> {

    long countByStatus(BatchStatus.ACTIVE);

    long countByStatus(BatchStatus.COMPLETED);

}