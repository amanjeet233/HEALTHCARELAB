package com.healthcare.labtestbooking.config;

import com.healthcare.labtestbooking.dto.ApiResponse;
import com.healthcare.labtestbooking.exception.*;
import lombok.extern.slf4j.Slf4j;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handle ResourceNotFoundException - 404
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
        public ApiResponse<?> handleResourceNotFoundException(ResourceNotFoundException ex) {
        
        log.error("Resource not found: {}", ex.getMessage());
        
                return ApiResponse.error("Resource not found: " + ex.getMessage());
    }

    /**
     * Handle BookingNotFoundException - 404
     */
    @ExceptionHandler(BookingNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
        public ApiResponse<?> handleBookingNotFoundException(BookingNotFoundException ex) {
        
        log.error("Booking not found: {}", ex.getMessage());
        
                return ApiResponse.error("Booking not found: " + ex.getMessage());
    }

    /**
     * Handle UserNotFoundException - 404
     */
    @ExceptionHandler(UserNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
        public ApiResponse<?> handleUserNotFoundException(UserNotFoundException ex) {
        
        log.error("User not found: {}", ex.getMessage());
        
                return ApiResponse.error("User not found: " + ex.getMessage());
    }

    /**
     * Handle UnauthorizedException - 401
     */
    @ExceptionHandler(UnauthorizedException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
        public ApiResponse<?> handleUnauthorizedException(UnauthorizedException ex) {
        
        log.warn("Unauthorized access attempt: {}", ex.getMessage());
        
                return ApiResponse.error("Unauthorized: " + ex.getMessage());
    }

    /**
     * Handle InvalidBookingException - 400
     */
    @ExceptionHandler(InvalidBookingException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
        public ApiResponse<?> handleInvalidBookingException(InvalidBookingException ex) {
        
        log.warn("Invalid booking: {}", ex.getMessage());
        
                return ApiResponse.error("Invalid booking: " + ex.getMessage());
    }

    /**
     * Handle PaymentFailedException - 402
     */
    @ExceptionHandler(PaymentFailedException.class)
    @ResponseStatus(HttpStatus.PAYMENT_REQUIRED)
        public ApiResponse<?> handlePaymentFailedException(PaymentFailedException ex) {
        
        log.error("Payment failed: {}", ex.getMessage());
        
                return ApiResponse.error("Payment failed: " + ex.getMessage());
    }

    /**
     * Handle UserAlreadyExistsException - 409
     */
    @ExceptionHandler(UserAlreadyExistsException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public ApiResponse<?> handleUserAlreadyExistsException(UserAlreadyExistsException ex) {
        log.error("User already exists: {}", ex.getMessage());
        return ApiResponse.error(ex.getMessage());
    }

    /**
     * Handle InvalidCredentialsException - 401
     */
    @ExceptionHandler(InvalidCredentialsException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ApiResponse<?> handleInvalidCredentials(InvalidCredentialsException ex) {
        log.error("Invalid credentials: {}", ex.getMessage());
        return ApiResponse.error(ex.getMessage());
    }

    /**
     * Handle RegistrationFailedException - 500
     */
    @ExceptionHandler(RegistrationFailedException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiResponse<?> handleRegistrationFailedException(RegistrationFailedException ex) {
        log.error("Registration failed: {}", ex.getMessage());
        return ApiResponse.error(ex.getMessage());
    }

    /**
     * Handle validation exceptions from @Valid annotation - 400
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
        public ApiResponse<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        
        Map<String, String> errors = new HashMap<>();
                ex.getBindingResult().getFieldErrors().forEach(error ->
                                errors.put(error.getField(), error.getDefaultMessage()));
        
        log.warn("Validation failed with {} errors", errors.size());
        
                return ApiResponse.error("Validation failed", errors);
    }

    /**
     * Handle DataIntegrityViolationException - 409
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public ApiResponse<?> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        log.error("Database constraint violation", ex);
        return ApiResponse.error("Data integrity violation: Duplicate entry or constraint violation");
    }

    /**
     * Handle EntityNotFoundException - 404
     */
    @ExceptionHandler(EntityNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ApiResponse<?> handleEntityNotFoundException(EntityNotFoundException ex) {
        log.error("Entity not found: {}", ex.getMessage());
        return ApiResponse.error("Entity not found: " + ex.getMessage());
    }

        /**
         * Handle AccessDeniedException - 403
         */
        @ExceptionHandler(AccessDeniedException.class)
        @ResponseStatus(HttpStatus.FORBIDDEN)
        public ApiResponse<?> handleAccessDeniedException(AccessDeniedException ex) {
                log.warn("Access denied: {}", ex.getMessage());
                return ApiResponse.error("Access denied: " + ex.getMessage());
        }

    /**
     * Handle BadCredentialsException - 401
     */
    @ExceptionHandler(BadCredentialsException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
        public ApiResponse<?> handleBadCredentials(BadCredentialsException ex) {
        log.warn("Invalid credentials provided");
                return ApiResponse.error("Invalid email or password");
    }

    /**
     * Handle UsernameNotFoundException - 404
     */
    @ExceptionHandler(UsernameNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
        public ApiResponse<?> handleUserNotFound(UsernameNotFoundException ex) {
        log.error("Username not found: {}", ex.getMessage());
                return ApiResponse.error(ex.getMessage());
    }

    /**
     * Handle IllegalArgumentException - 400
     */
    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
        public ApiResponse<?> handleIllegalArgumentException(IllegalArgumentException ex) {
        
        log.warn("Illegal argument: {}", ex.getMessage());
        
                return ApiResponse.error("Invalid argument: " + ex.getMessage());
    }

    /**
     * Handle MissingServletRequestParameterException - 400
     */
    @ExceptionHandler(MissingServletRequestParameterException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<?> handleMissingServletRequestParameterException(MissingServletRequestParameterException ex) {
        log.warn("Missing request parameter: {}", ex.getMessage());
        return ApiResponse.error("Missing required request parameter: " + ex.getParameterName());
    }

    /**
     * Handle RuntimeException - 400
     */
    @ExceptionHandler(RuntimeException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
        public ApiResponse<?> handleRuntimeException(RuntimeException ex) {
        log.error("Runtime exception: {}", ex.getMessage());
                return ApiResponse.error(ex.getMessage());
    }

    /**
     * Handle generic Exception - 500
     */
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
        public ApiResponse<?> handleGenericException(Exception ex) {
        log.error("An unexpected error occurred", ex);
                return ApiResponse.error("An unexpected error occurred: " + ex.getMessage());
    }
}
