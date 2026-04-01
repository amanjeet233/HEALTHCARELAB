package com.healthcare.labtestbooking.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CORS Configuration - Allows frontend requests from development servers
 * ✅ Handles preflight OPTIONS requests automatically
 * ✅ Allows credentials (cookies, authorization headers)
 * ✅ Supports all HTTP methods
 * ✅ Exposes Authorization header to frontend
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            // ✅ Allow frontend development origins
            .allowedOrigins(
                "http://localhost:5173",      // Vite default
                "http://localhost:3000",      // Alternative React dev
                "http://localhost:5174",      // Secondary Vite port
                "http://127.0.0.1:5173"       // Localhost alternative
            )
            // ✅ Allow all HTTP methods
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
            // ✅ Allow all headers (Content-Type, Authorization, etc.)
            .allowedHeaders("*")
            // ✅ Allow credentials (cookies, basic auth)
            .allowCredentials(true)
            // ✅ Cache preflight requests for 1 hour
            .maxAge(3600)
            // ✅ Expose custom headers to frontend
            .exposedHeaders("Authorization", "Content-Type", "X-Total-Count", "X-Page-Count");
    }
}
