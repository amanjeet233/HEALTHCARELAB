package com.healthcare.labtestbooking.util;

import com.healthcare.labtestbooking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class TestDataCleaner implements CommandLineRunner {

    private final UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        // Only run in development mode
        if (args.length > 0 && "clean".equals(args[0])) {
            log.info("Cleaning test data...");
            
            // Delete test users
            userRepository.findByEmail("patient@test.com").ifPresent(user -> {
                userRepository.delete(user);
                log.info("Deleted test patient");
            });
            
            userRepository.findByEmail("tech@test.com").ifPresent(user -> {
                userRepository.delete(user);
                log.info("Deleted test technician");
            });
            
            userRepository.findByEmail("doctor@test.com").ifPresent(user -> {
                userRepository.delete(user);
                log.info("Deleted test doctor");
            });
            
            log.info("Test data cleaned successfully");
        }
    }
}
