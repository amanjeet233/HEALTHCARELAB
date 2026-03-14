package com.healthcare.labtestbooking.config;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

/**
 * Redis Cache Configuration for storing frequently accessed data.
 * 
 * Cache TTL Configuration:
 * - allTests: 1 hour (3600 seconds)
 * - testById: 24 hours (86400 seconds)
 * - packages: 1 hour (3600 seconds)
 * - searchResults: 30 minutes (1800 seconds)
 * - filterResults: 30 minutes (1800 seconds)
 * - testsByCategory: 1 hour (3600 seconds)
 * - testsByType: 1 hour (3600 seconds)
 * - bestDeals: 1 hour (3600 seconds)
 * - typesList: 24 hours (86400 seconds)
 */
@Configuration
@EnableCaching
public class CacheConfig {

        private RedisCacheConfiguration createCacheConfig(Duration ttl) {
                return RedisCacheConfiguration.defaultCacheConfig()
                                .entryTtl(ttl)
                                .disableCachingNullValues()
                                .serializeKeysWith(RedisSerializationContext.SerializationPair
                                                .fromSerializer(new StringRedisSerializer()))
                                .serializeValuesWith(RedisSerializationContext.SerializationPair
                                                .fromSerializer(new GenericJackson2JsonRedisSerializer()));
        }

        /**
         * Configure Redis cache manager with different TTLs for different cache names
         */
        @Bean
        public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
                Map<String, RedisCacheConfiguration> cacheConfigurationsMap = new HashMap<>();

                // 1 hour cache for list endpoints
                RedisCacheConfiguration oneHourConfig = createCacheConfig(Duration.ofHours(1));

                cacheConfigurationsMap.put("allTests", oneHourConfig);
                cacheConfigurationsMap.put("packages", oneHourConfig);
                cacheConfigurationsMap.put("testsByCategory", oneHourConfig);
                cacheConfigurationsMap.put("testsByType", oneHourConfig);
                cacheConfigurationsMap.put("bestDeals", oneHourConfig);

                // 30 minutes cache for search and filter
                RedisCacheConfiguration thirtyMinutesConfig = createCacheConfig(Duration.ofMinutes(30));

                cacheConfigurationsMap.put("searchResults", thirtyMinutesConfig);
                cacheConfigurationsMap.put("filterResults", thirtyMinutesConfig);

                // 24 hours cache for individual resource lookups
                RedisCacheConfiguration twentyFourHoursConfig = createCacheConfig(Duration.ofHours(24));

                cacheConfigurationsMap.put("testById", twentyFourHoursConfig);
                cacheConfigurationsMap.put("packageById", twentyFourHoursConfig);
                cacheConfigurationsMap.put("typesList", twentyFourHoursConfig);

                // Default configuration: 30 minutes for any unconfigured cache
                RedisCacheConfiguration defaultConfig = createCacheConfig(Duration.ofMinutes(30));

                return RedisCacheManager.builder(connectionFactory)
                                .cacheDefaults(defaultConfig)
                                .withInitialCacheConfigurations(cacheConfigurationsMap)
                                .build();
        }
}
