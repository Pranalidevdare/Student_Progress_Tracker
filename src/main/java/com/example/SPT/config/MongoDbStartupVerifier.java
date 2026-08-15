package com.example.SPT.config;

import static java.lang.String.format;

import com.mongodb.BasicDBObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class MongoDbStartupVerifier implements ApplicationRunner {

    private final MongoTemplate mongoTemplate;

    @Value("${spring.data.mongodb.database:api_marketplace}")
    private String databaseName;

    @Value("${spring.data.mongodb.uri:}")
    private String mongoUri;

    @Override
    public void run(ApplicationArguments args) {
        log.info("MongoDB connection starting...");

        if (mongoUri == null || mongoUri.isBlank()) {
            throw new IllegalStateException(
                    "MONGODB_URI is not configured. Add your Atlas connection string to the .env file or environment variables before starting the backend."
            );
        }

        try {
            var database = mongoTemplate.getDb();
            if (database == null) {
                throw new IllegalStateException("MongoDB database handle is null. Check the Atlas URI and credentials.");
            }

            var pingResult = database.runCommand(new BasicDBObject("ping", 1));
            if (pingResult == null || pingResult.get("ok", Number.class) == null || pingResult.get("ok", Number.class).doubleValue() != 1.0) {
                throw new IllegalStateException("MongoDB ping check failed. Verify Atlas network access and database credentials.");
            }

            String activeDatabase = database.getName();
            if (activeDatabase == null || activeDatabase.isBlank()) {
                throw new IllegalStateException("MongoDB database name could not be determined from the configured connection.");
            }

            if (!activeDatabase.equalsIgnoreCase(databaseName)) {
                throw new IllegalStateException(
                        format("Connected database mismatch. Expected '%s' but connected to '%s'. Update MONGODB_DATABASE or the Atlas URI to use api_marketplace.", databaseName, activeDatabase)
                );
            }

            log.info("MongoDB connected successfully");
            log.info("Database: {}", activeDatabase);
            log.info("Connected database: {}", activeDatabase);
        } catch (Exception ex) {
            log.error("MongoDB connection failed. Check the Atlas URI, database user credentials, Atlas Network Access, and cluster availability.", ex);
            throw new IllegalStateException("MongoDB connection failed. Check Atlas Network Access, credentials, URI, and cluster availability.", ex);
        }
    }
}
