# Deployment Guide

> Deployment, operations, and reliability guide for the Healthcare Lab Test Booking System

## Table of Contents

- [Overview](#overview)
- [Local Deployment with Maven](#local-deployment-with-maven)
- [Local Deployment with Docker](#local-deployment-with-docker)
- [Cloud Deployment](#cloud-deployment)
- [Environment Variables](#environment-variables)
- [Database Migration Steps](#database-migration-steps)
- [SSL/HTTPS Setup](#sslhttps-setup)
- [Monitoring Setup](#monitoring-setup)
- [Backup Strategy](#backup-strategy)
- [Troubleshooting Guide](#troubleshooting-guide)

---

## Overview

This guide covers local, container, and cloud deployments for the Healthcare Lab Test Booking System. It also documents required environment variables, database migration steps, SSL setup, monitoring, backups, and common troubleshooting steps.

---

## Local Deployment with Maven

### Prerequisites

- Java 21
- Maven 3.9+
- MySQL 8.0
- Redis 7 (optional but recommended)

### Steps

1. Configure application settings in `src/main/resources/application.properties`.
2. Initialize the database schema and seed data if required.
3. Build and run the application.

```bash
mvn clean install
mvn spring-boot:run
```

### Run the JAR directly

```bash
java -jar target/lab-test-booking-0.0.1-SNAPSHOT.jar
```

### Verify

- Health check: `http://localhost:8080/actuator/health`
- Swagger UI: `http://localhost:8080/swagger-ui.html`

---

## Local Deployment with Docker

### Docker Compose (recommended)

Create or use an existing `docker-compose.yml` with MySQL, Redis, and the app service.

```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: lab_test_booking
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/lab_test_booking
      SPRING_REDIS_HOST: redis
    depends_on:
      - mysql
      - redis

volumes:
  mysql_data:
```

### Build and run

```bash
docker compose up -d --build
```

### Verify

- `docker compose ps`
- Health check: `http://localhost:8080/actuator/health`

---

## Cloud Deployment

### AWS (ECS or EKS)

**ECS (Fargate) overview:**
- Build and push Docker image to ECR.
- Create an ECS task definition with environment variables.
- Provision an RDS MySQL instance and ElastiCache Redis.
- Create an Application Load Balancer (ALB).
- Deploy service with autoscaling rules.

**EKS overview:**
- Push Docker image to ECR.
- Create Kubernetes Deployment and Service.
- Use RDS and ElastiCache.
- Configure HPA for scaling.

### GCP (Cloud Run or GKE)

**Cloud Run overview:**
- Build and push Docker image to Artifact Registry.
- Deploy Cloud Run service with env vars.
- Use Cloud SQL (MySQL) and Memorystore (Redis).
- Configure Cloud Load Balancer + HTTPS.

**GKE overview:**
- Deploy to GKE with a Kubernetes Deployment and Service.
- Use Cloud SQL and Memorystore.
- Configure HPA and ingress.

### Azure (App Service or AKS)

**App Service overview:**
- Build and push Docker image to ACR.
- Deploy Web App for Containers.
- Use Azure Database for MySQL and Azure Cache for Redis.
- Configure Application Gateway or Front Door for TLS.

**AKS overview:**
- Deploy image to AKS with Helm or YAML.
- Use Azure Database for MySQL and Azure Cache for Redis.
- Configure HPA and ingress (NGINX or App Gateway).

---

## Environment Variables

Set these variables in your deployment environment. Use secrets managers for sensitive values.

### Core

- `SERVER_PORT` (default: 8080)
- `SPRING_PROFILES_ACTIVE` (e.g., `prod`)

### Database

- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`

### Redis

- `SPRING_REDIS_HOST`
- `SPRING_REDIS_PORT`
- `SPRING_REDIS_PASSWORD` (if enabled)

### JWT

- `APP_JWT_SECRET`
- `APP_JWT_EXPIRATION`
- `APP_JWT_REFRESH_EXPIRATION`

### Email (SMTP)

- `SPRING_MAIL_HOST`
- `SPRING_MAIL_PORT`
- `SPRING_MAIL_USERNAME`
- `SPRING_MAIL_PASSWORD`

### Payment Gateway

- `PAYMENT_GATEWAY_TYPE`
- `PAYMENT_GATEWAY_API_KEY`
- `PAYMENT_GATEWAY_SECRET`
- `PAYMENT_GATEWAY_WEBHOOK_SECRET`

### Notifications

- `SMS_GATEWAY_TYPE`
- `SMS_GATEWAY_API_KEY`
- `SMS_GATEWAY_SENDER_ID`

---

## Database Migration Steps

### Recommended Approach

Use a migration tool such as Flyway or Liquibase. If not currently used, add it to the build before production deployments.

### Example Steps (Flyway)

1. Add Flyway dependency to `pom.xml`.
2. Create migration scripts in `src/main/resources/db/migration/`.
3. Apply migrations on startup or with a CI task.

```bash
mvn -Dflyway.configFiles=flyway.conf flyway:migrate
```

### Manual SQL (for initial setup)

```sql
CREATE DATABASE lab_test_booking;
CREATE USER 'labtest_user'@'%' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON lab_test_booking.* TO 'labtest_user'@'%';
FLUSH PRIVILEGES;
```

---

## SSL/HTTPS Setup

### Local (Self-signed)

```bash
keytool -genkeypair -alias labtestbooking -keyalg RSA -keysize 2048 \
  -storetype PKCS12 -keystore keystore.p12 -validity 3650
```

Configure Spring Boot:

```properties
server.ssl.key-store=classpath:keystore.p12
server.ssl.key-store-password=changeit
server.ssl.key-store-type=PKCS12
server.ssl.key-alias=labtestbooking
```

### Production

- Terminate TLS at the load balancer (ALB, Cloud Load Balancer, Azure Front Door).
- Use a managed certificate (ACM, Google Managed SSL, Azure Key Vault).
- Forward traffic to the application over HTTPS or HTTP on a private network.

---

## Monitoring Setup

### Application Metrics

- Enable Spring Boot Actuator
- Expose `/actuator/health`, `/actuator/metrics`, `/actuator/prometheus`

```properties
management.endpoints.web.exposure.include=health,info,metrics,prometheus
management.endpoint.health.show-details=always
```

### Prometheus + Grafana

1. Configure Prometheus to scrape `/actuator/prometheus`.
2. Import Spring Boot dashboards in Grafana.
3. Set alert rules for latency, error rate, and memory usage.

### Logging

- Configure structured logs (JSON if possible).
- Ship logs to ELK/Cloud Logging/Log Analytics.

---

## Backup Strategy

### Database Backups

- Daily full backup
- Hourly incremental backup (if supported)
- Retain backups for 30-90 days
- Store backups in a separate region

Example MySQL backup:

```bash
mysqldump -u labtest_user -p lab_test_booking > backup_$(date +%F).sql
```

### Redis Backups

- Enable RDB snapshots or AOF
- Backup snapshots daily
- Store in object storage

### File Storage

- Enable versioning for report PDFs
- Configure lifecycle policies for older reports

---

## Troubleshooting Guide

### 1) Application fails to start

**Check:**
- Database connectivity
- Redis connectivity (if enabled)
- Missing environment variables

**Fix:**
- Verify `SPRING_DATASOURCE_*` values
- Check `SPRING_REDIS_HOST` and port
- Ensure DB user has privileges

### 2) 401 Unauthorized errors

**Check:**
- JWT secret mismatch
- Token expired

**Fix:**
- Re-login to obtain a fresh token
- Ensure `APP_JWT_SECRET` matches across services

### 3) Slow response times

**Check:**
- Database indexes
- Cache hit rate
- High CPU or memory usage

**Fix:**
- Add or review indexes
- Increase cache TTL or size
- Scale the service

### 4) Payment webhook failures

**Check:**
- Webhook signature configuration
- Gateway endpoint reachability

**Fix:**
- Verify `PAYMENT_GATEWAY_WEBHOOK_SECRET`
- Whitelist gateway IPs if required

### 5) PDF download fails

**Check:**
- Storage access
- File permissions

**Fix:**
- Verify object storage credentials
- Ensure correct file path and bucket settings

---

Last updated: February 18, 2026
