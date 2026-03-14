package com.healthcare.labtestbooking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@SpringBootApplication
@EnableTransactionManagement
@EnableScheduling
@EnableJpaAuditing
public class LabTestBookingApplication {

    public static void main(String[] args) {
        SpringApplication.run(LabTestBookingApplication.class, args);
    }
}
