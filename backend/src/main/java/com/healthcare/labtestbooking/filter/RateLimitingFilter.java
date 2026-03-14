package com.healthcare.labtestbooking.filter;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Slf4j
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final Duration WINDOW = Duration.ofMinutes(1);
    private static final Bandwidth LOGIN_LIMIT = Bandwidth.classic(50, Refill.intervally(50, WINDOW));
    private static final Bandwidth PUBLIC_LIMIT = Bandwidth.classic(100, Refill.intervally(100, WINDOW));
    private static final Bandwidth AUTH_LIMIT = Bandwidth.classic(500, Refill.intervally(500, WINDOW));

    private final Map<String, Bucket> loginBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> publicBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> userBuckets = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        if (shouldSkip(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        Bucket bucket = resolveBucket(request);
        if (bucket.tryConsume(1)) {
            filterChain.doFilter(request, response);
            return;
        }

        respondTooManyRequests(response);
    }

    private boolean shouldSkip(HttpServletRequest request) {
        String method = request.getMethod();
        if ("OPTIONS".equalsIgnoreCase(method)) {
            return true;
        }

        String path = request.getRequestURI();
        return path.startsWith("/h2-console/");
    }

    private Bucket resolveBucket(HttpServletRequest request) {
        if (isLoginRequest(request)) {
            String ip = getClientIp(request);
            return loginBuckets.computeIfAbsent(ip, key -> newBucket(LOGIN_LIMIT));
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (isAuthenticated(authentication)) {
            String userKey = authentication.getName();
            return userBuckets.computeIfAbsent(userKey, key -> newBucket(AUTH_LIMIT));
        }

        String ip = getClientIp(request);
        return publicBuckets.computeIfAbsent(ip, key -> newBucket(PUBLIC_LIMIT));
    }

    private boolean isLoginRequest(HttpServletRequest request) {
        return "POST".equalsIgnoreCase(request.getMethod())
                && "/api/auth/login".equals(request.getRequestURI());
    }

    private boolean isAuthenticated(Authentication authentication) {
        return authentication != null
                && authentication.isAuthenticated()
                && !(authentication instanceof AnonymousAuthenticationToken);
    }

    private Bucket newBucket(Bandwidth limit) {
        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    private String getClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            int commaIndex = forwarded.indexOf(',');
            if (commaIndex > 0) {
                return forwarded.substring(0, commaIndex).trim();
            }
            return forwarded.trim();
        }
        return request.getRemoteAddr();
    }

    private void respondTooManyRequests(HttpServletResponse response) throws IOException {
        response.setStatus(429);
        response.setContentType("application/json");
        response.getWriter().write("{\"message\":\"Too many requests\",\"status\":429}");
        log.warn("Rate limit exceeded; returning 429");
    }
}
