package com.healthcare.labtestbooking.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@RequiredArgsConstructor
@Component
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsServiceImpl userDetailsService;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();

        // Public / infrastructure endpoints that should not require JWT parsing
        return path.startsWith("/api/auth/")
                || path.startsWith("/api/public/")
                || path.startsWith("/api/health")
                || path.startsWith("/actuator/")
                || path.startsWith("/swagger-ui")
                || path.startsWith("/v3/api-docs")
                || path.startsWith("/api-docs")
                || path.startsWith("/h2-console")
                || "/swagger-ui.html".equals(path)
                || "/error".equals(path);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        try {
            String jwt = getJwtFromRequest(request);
            log.debug("JWT filter invoked for {} {}. Token present: {}",
                    request.getMethod(), request.getRequestURI(), StringUtils.hasText(jwt));

            if (StringUtils.hasText(jwt) && jwtUtil.validateToken(jwt)) {
                String email = jwtUtil.extractUsername(jwt);
                log.debug("JWT validated successfully. Subject(email): {}", email);

                UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                log.debug("Loaded user details for {} with authorities {}", email, userDetails.getAuthorities());

                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);
                log.debug("SecurityContext updated for {}", email);
            } else if (StringUtils.hasText(jwt)) {
                log.debug("JWT validation failed for request {} {}", request.getMethod(), request.getRequestURI());
            }
        } catch (Exception ex) {
            log.error("Could not set user authentication in security context", ex);
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
