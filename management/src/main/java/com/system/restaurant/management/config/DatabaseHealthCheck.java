package com.system.restaurant.management.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseHealthCheck implements CommandLineRunner {

    private final DataSource dataSource;

    @Override
    public void run(String... args) throws Exception {
        checkDatabaseConnection();
    }

    private void checkDatabaseConnection() {
        try (Connection connection = dataSource.getConnection()) {
            if (connection != null && !connection.isClosed()) {
                log.info(" Database connection established successfully!");
                log.info("Database URL: {}", connection.getMetaData().getURL());
                log.info("Database Product: {}", connection.getMetaData().getDatabaseProductName());
                log.info("Database Version: {}", connection.getMetaData().getDatabaseProductVersion());
            } else {
                log.error(" Database connection failed!");
            }
        } catch (Exception e) {
            log.error(" Error connecting to database: {}", e.getMessage());
        }
    }
}