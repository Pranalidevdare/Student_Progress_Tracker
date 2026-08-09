package com.example.SPT.config;

import java.io.InputStream;
import java.util.Arrays;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.example.SPT.entity.AptitudeQuestion;
import com.example.SPT.repository.AptitudeQuestionRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class AptitudeQuestionDataLoader implements CommandLineRunner {

    private final AptitudeQuestionRepository aptitudeQuestionRepository;

    private final ObjectMapper objectMapper;

    @Override
    public void run(String... args) throws Exception {

        /*
         * Do not insert duplicate questions every time
         * the application starts.
         */
        if (aptitudeQuestionRepository.count() > 0) {
            return;
        }

        ClassPathResource resource =
                new ClassPathResource(
                        "data/aptitude_questions.json");

        try (InputStream inputStream =
                     resource.getInputStream()) {

            AptitudeQuestion[] questions =
                    objectMapper.readValue(
                            inputStream,
                            AptitudeQuestion[].class);

            List<AptitudeQuestion> questionList =
                    Arrays.asList(questions);

            aptitudeQuestionRepository.saveAll(questionList);
        }
    }
}