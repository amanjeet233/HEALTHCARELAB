# ===================================================================
# HEALTHCARE LAB TEST BOOKING API - APPLICATION PROPERTIES
# ===================================================================
# Configuration for Spring Boot application with security, database,
# caching, and monitoring settings.
#
# PROPERTY NAMING CONVENTIONS:
# - Database: spring.datasource.*, spring.jpa.*
# - JWT: jwt.*, app.jwt.*, application.security.jwt.*
# - Server: server.*, management.*
# - Logging: logging.level.*
# - Cache: spring.cache.*, spring.redis.*
#
# ENVIRONMENT OVERRIDES:
# Use application-{profile}.properties for dev/test/prod overrides
# Profiles: dev, test, prod, ci
#
# ===================================================================

# ===================================================================
# 1. SERVER CONFIGURATION
# ===================================================================
server.port=8080
server.servlet.context-path=/
server.error.include-message=always
server.error.include-binding-errors=always
server.error.include-stacktrace=on_param
server.error.include-exception=false  # Never expose exceptions in responses
server.tomcat.max-threads=200
server.tomcat.min-spare-threads=10
server.tomcat.accept-count=100

# ===================================================================
# 2. DATABASE CONFIGURATION (MySQL 8.0+)
# ===================================================================
spring.datasource.url=jdbc:mysql://localhost:3306/healthcare_lab_db
spring.datasource.username=root
spring.datasource.password=
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# Connection Pooling (HikariCP)
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=20000
spring.datasource.hikari.idle-timeout=300000
spring.datasource.hikari.max-lifetime=1200000

# ===================================================================
# 3. JPA / HIBERNATE CONFIGURATION
# ===================================================================
spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect
spring.jpa.hibernate.ddl-auto=update  # Use 'validate' in production
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.use_sql_comments=true
spring.jpa.properties.hibernate.jdbc.batch_size=20
spring.jpa.properties.hibernate.order_inserts=true
spring.jpa.properties.hibernate.order_updates=true
spring.jpa.properties.hibernate.jdbc.batch_versioned_data=true

# Entity scanning
spring.jpa.properties.hibernate.enable_lazy_load_no_trans=true
spring.jpa.open-in-view=false  # Prevent lazy loading in views (better practice)

# ===================================================================
# 4. JWT SECURITY CONFIGURATION
# ===================================================================
# JWT Token Secret (Base64 encoded - supports multiple property names for compatibility)
jwt.secret=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
app.jwt.secret=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
application.security.jwt.secret-key=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970

# Token Expiration Times (in milliseconds)
# 24 hours for access token
jwt.expiration=86400000
app.jwt.expiration-ms=86400000
application.security.jwt.expiration=86400000

# 7 days for refresh token
jwt.refresh-expiration=604800000
app.jwt.refresh-expiration-ms=604800000
app.jwt.refresh-expiration=604800000

# ===================================================================
# 5. SPRING SECURITY & AUTHENTICATION
# ===================================================================
spring.security.user.name=admin
spring.security.user.password=admin123
spring.security.user.roles=ADMIN

# ===================================================================
# 6. CACHING CONFIGURATION (Redis)
# ===================================================================
spring.cache.type=redis
spring.redis.host=localhost
spring.redis.port=6379
spring.redis.timeout=2000ms
spring.redis.jedis.pool.max-active=8
spring.redis.jedis.pool.max-idle=8
spring.redis.jedis.pool.min-idle=0

# ===================================================================
# 7. LOGGING CONFIGURATION
# ===================================================================
logging.level.root=INFO
logging.level.com.healthcare.labtestbooking=DEBUG
logging.level.org.springframework.security=DEBUG
logging.level.org.springframework.web=DEBUG
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE

# Console output format
logging.pattern.console=%d{yyyy-MM-dd HH:mm:ss} - %logger{36} - %msg%n

# File output (optional)
logging.file.name=logs/application.log
logging.file.max-size=10MB
logging.file.max-history=10

# ===================================================================
# 8. ACTUATOR / MONITORING ENDPOINTS
# ===================================================================
management.endpoints.web.exposure.include=health,info,metrics
management.endpoint.health.show-details=always
management.health.livenessState.enabled=true
management.health.readinessState.enabled=true

# ===================================================================
# 9. APPLICATION INFORMATION (for /actuator/info)
# ===================================================================
spring.application.name=Healthcare Lab Test Booking API
application.version=1.0.0
application.description=Comprehensive API for healthcare lab test booking and management
application.developer=EPAM Educational Project

# ===================================================================
# 10. SERVLET CONFIGURATION
# ===================================================================
spring.servlet.multipart.max-file-size=50MB
spring.servlet.multipart.max-request-size=50MB
spring.servlet.multipart.enabled=true

# ===================================================================
# 11. JACKSON JSON CONFIGURATION
# ===================================================================
spring.jackson.serialization.write-dates-as-timestamps=false
spring.jackson.time-zone=UTC
spring.jackson.default-property-inclusion=non_null

# ===================================================================
# 12. MAIL CONFIGURATION (if email functionality enabled)
# ===================================================================
# spring.mail.host=smtp.gmail.com
# spring.mail.port=587
# spring.mail.username=${MAIL_USERNAME}
# spring.mail.password=${MAIL_PASSWORD}
# spring.mail.properties.mail.smtp.auth=true
# spring.mail.properties.mail.smtp.starttls.enable=true
# spring.mail.properties.mail.smtp.starttls.required=true

# ===================================================================
# 13. BEAN OVERRIDE CONFIGURATION (Spring Boot 3.1+)
# ===================================================================
spring.main.allow-bean-definition-overriding=false

# ===================================================================
# PROFILE-SPECIFIC OVERRIDES
# ===================================================================
# For development: Create application-dev.properties
# For testing: Create application-test.properties
# For production: Create application-prod.properties
#
# Example (application-prod.properties):
# spring.datasource.url=jdbc:mysql://prod-db.example.com:3306/healthcare_lab_db
# spring.datasource.password=${DB_PASSWORD}
# spring.jpa.hibernate.ddl-auto=validate
# logging.level.root=WARN
# logging.level.com.healthcare.labtestbooking=INFO
