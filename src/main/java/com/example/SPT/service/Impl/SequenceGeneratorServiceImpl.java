package com.example.SPT.service.Impl;

import static org.springframework.data.mongodb.core.FindAndModifyOptions.options;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import com.example.SPT.entity.DatabaseSequence;
import com.example.SPT.service.SequenceGeneratorService;

@Service
public class SequenceGeneratorServiceImpl
        implements SequenceGeneratorService {

    @Autowired
    private MongoOperations mongoOperations;

    @Override
    public long generateSequence(String sequenceName) {

        Query query = new Query(
                Criteria.where("_id").is(sequenceName));

        Update update = new Update().inc("sequence", 1);

        DatabaseSequence counter = mongoOperations.findAndModify(
                query,
                update,
                options().returnNew(true).upsert(true),
                DatabaseSequence.class);

        return counter != null
                ? counter.getSequence()
                : 1;
    }
}