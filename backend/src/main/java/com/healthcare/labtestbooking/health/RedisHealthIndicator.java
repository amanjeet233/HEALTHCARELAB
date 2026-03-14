package com.healthcare.labtestbooking.health;

import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

@Component
public class RedisHealthIndicator implements HealthIndicator {

    private final RedisTemplate<String, Object> redisTemplate;

    public RedisHealthIndicator(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    public Health health() {
        try {
            // Test Redis connection with PING command
            String result = redisTemplate.getConnectionFactory()
                    .getConnection()
                    .ping();

            if ("PONG".equals(result)) {
                return Health.up()
                        .withDetail("cache", "Redis")
                        .withDetail("status", "Connected")
                        .build();
            } else {
                return Health.down()
                        .withDetail("cache", "Redis")
                        .withDetail("reason", "Unexpected response: " + result)
                        .build();
            }
        } catch (Exception e) {
            return Health.down()
                    .withDetail("cache", "Redis")
                    .withDetail("reason", "Connection failed: " + e.getMessage())
                    .withException(e)
                    .build();
        }
    }
}

