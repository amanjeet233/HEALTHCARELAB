package com.healthcare.labtestbooking.filter;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Rate Limiting Filter - Prevents abuse with relaxed limits for development
 * ✅ 1000 requests per minute (very relaxed for development/testing)
 * ✅ Exempts public endpoints: /api/lab-tests, /api/packages, /api/auth, /health
 * ✅ Returns 429 (Too Many Requests) when limit exceeded
 */
@Component
@Slf4j
public class RateLimitingFilter extends OncePerRequestFilter {

    private final Map<String, RateLimitInfo> requestCounts = new ConcurrentHashMap<>();

    private static final int MAX_REQUESTS = 1000;  // ✅ INCREASED from 100 to 1000
    private static final long WINDOW_SIZE_MS = 60_000;
    private static final long CLEANUP_INTERVAL_MS = 300_000;
    private long lastCleanup = System.currentTimeMillis();

    @Override
    protected void doFilterInternal(@org.springframework.lang.NonNull HttpServletRequest request,
                                    @org.springframework.lang.NonNull HttpServletResponse response,
                                    @org.springframework.lang.NonNull FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        if (isExemptedEndpoint(path)) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientId = getClientId(request);
        RateLimitInfo info = requestCounts.getOrDefault(clientId, new RateLimitInfo());

        long currentTime = System.currentTimeMillis();

        if (currentTime - info.resetTime > WINDOW_SIZE_MS) {
            info.reset();
        }

        if (info.requestCount >= MAX_REQUESTS) {
            log.warn("Rate limit exceeded for IP: {}", clientId);
            response.setStatus(429);
            response.setContentType("application/json");
            response.getWriter().write(
                    "{\"success\": false, \"message\": \"Rate limit exceeded\"}"
            );
            return;
        }

        info.requestCount++;
        requestCounts.put(clientId, info);

        if (currentTime - lastCleanup > CLEANUP_INTERVAL_MS) {
            cleanupOldEntries(currentTime);
            lastCleanup = currentTime;
        }

        filterChain.doFilter(request, response);
    }

    private boolean isExemptedEndpoint(String path) {
        return path.contains("/api/tests") ||
                path.contains("/api/lab-tests") ||
                path.contains("/api/packages") ||
                path.contains("/api/doctors") ||
                path.contains("/api/auth") ||
                path.contains("/health") ||
                path.contains("/actuator");
    }

    private String getClientId(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isEmpty()) {
            return xff.split(",")[0].trim();
        }
        String remoteAddr = request.getRemoteAddr();
        return remoteAddr != null ? remoteAddr : "unknown";
    }

    private synchronized void cleanupOldEntries(long currentTime) {
        requestCounts.entrySet().removeIf(entry ->
                currentTime - entry.getValue().resetTime > CLEANUP_INTERVAL_MS
        );
    }

    static class RateLimitInfo {
        int requestCount = 0;
        long resetTime = System.currentTimeMillis();

        void reset() {
            this.requestCount = 0;
            this.resetTime = System.currentTimeMillis();
        }
    }
}
