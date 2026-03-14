# Setup Guide

> Complete installation and configuration guide for the Healthcare Lab Test Booking System

## 📋 Table of Contents

- [System Requirements](#system-requirements)
- [Prerequisites Installation](#prerequisites-installation)
  - [Java 21 Installation](#java-21-installation)
  - [MySQL 8.0 Installation](#mysql-80-installation)
  - [Redis 7 Installation](#redis-7-installation)
  - [Maven Installation](#maven-installation)
  - [IDE Setup](#ide-setup)
- [Database Setup](#database-setup)
- [Application Configuration](#application-configuration)
- [Building the Application](#building-the-application)
- [Running the Application](#running-the-application)
- [Data Initialization](#data-initialization)
- [Docker Setup](#docker-setup)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)
- [Next Steps](#next-steps)

---

## 💻 System Requirements

### Minimum Requirements

| Component | Specification |
|-----------|--------------|
| **OS** | Windows 10/11, macOS 11+, Ubuntu 20.04+ |
| **CPU** | 2 cores (4 cores recommended) |
| **RAM** | 4 GB (8 GB recommended) |
| **Storage** | 2 GB free space |
| **Network** | Internet connection for dependencies |

### Recommended for Development

| Component | Specification |
|-----------|--------------|
| **CPU** | 4+ cores (Intel i5/i7 or AMD Ryzen 5/7) |
| **RAM** | 16 GB |
| **Storage** | SSD with 10+ GB free space |
| **Display** | 1920x1080 or higher |

---

## 🔧 Prerequisites Installation

### Java 21 Installation

#### Windows

1. **Download Java 21:**
   ```bash
   # Visit Oracle or Adoptium
   https://www.oracle.com/java/technologies/downloads/#java21
   # OR
   https://adoptium.net/temurin/releases/?version=21
   ```

2. **Install Java:**
   - Run the downloaded installer (.exe)
   - Follow the installation wizard
   - Select installation directory (default: `C:\Program Files\Java\jdk-21`)

3. **Set JAVA_HOME Environment Variable:**
   ```powershell
   # Open PowerShell as Administrator
   [System.Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Java\jdk-21", "Machine")
   [System.Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\Program Files\Java\jdk-21\bin", "Machine")
   ```

4. **Verify Installation:**
   ```powershell
   java -version
   # Expected output:
   # openjdk version "21.0.2" 2024-01-16
   # OpenJDK Runtime Environment (build 21.0.2+13-58)
   # OpenJDK 64-Bit Server VM (build 21.0.2+13-58, mixed mode, sharing)
   ```

#### macOS

1. **Using Homebrew (Recommended):**
   ```bash
   # Install Homebrew if not installed
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   
   # Install Java 21
   brew install openjdk@21
   
   # Link Java
   sudo ln -sfn /opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-21.jdk
   ```

2. **Set JAVA_HOME:**
   ```bash
   echo 'export JAVA_HOME=$(/usr/libexec/java_home -v 21)' >> ~/.zshrc
   echo 'export PATH=$JAVA_HOME/bin:$PATH' >> ~/.zshrc
   source ~/.zshrc
   ```

3. **Verify Installation:**
   ```bash
   java -version
   ```

#### Linux (Ubuntu/Debian)

1. **Install Java 21:**
   ```bash
   # Update package index
   sudo apt update
   
   # Install OpenJDK 21
   sudo apt install openjdk-21-jdk -y
   ```

2. **Set JAVA_HOME:**
   ```bash
   echo 'export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64' >> ~/.bashrc
   echo 'export PATH=$JAVA_HOME/bin:$PATH' >> ~/.bashrc
   source ~/.bashrc
   ```

3. **Verify Installation:**
   ```bash
   java -version
   javac -version
   ```

---

### MySQL 8.0 Installation

#### Windows

1. **Download MySQL Installer:**
   ```
   https://dev.mysql.com/downloads/installer/
   ```
   - Download: mysql-installer-community-8.0.36.0.msi

2. **Run Installer:**
   - Choose "Custom" installation
   - Select components:
     - MySQL Server 8.0.36
     - MySQL Workbench 8.0
     - MySQL Shell

3. **Configure MySQL Server:**
   - **Server Configuration Type:** Development Computer
   - **Port:** 3306 (default)
   - **Authentication Method:** Use Strong Password Encryption
   - **Root Password:** Set a strong password (e.g., `root123`)
   - **Windows Service Name:** MySQL80
   - **Start at System Startup:** ✓ Enabled

4. **Complete Installation:**
   - Execute configuration
   - Apply configuration
   - Finish

5. **Verify Installation:**
   ```powershell
   mysql --version
   # Expected: mysql  Ver 8.0.36 for Win64 on x86_64
   
   # Test connection
   mysql -u root -p
   # Enter password when prompted
   ```

#### macOS

1. **Using Homebrew:**
   ```bash
   # Install MySQL
   brew install mysql@8.0
   
   # Start MySQL service
   brew services start mysql@8.0
   
   # Secure installation
   mysql_secure_installation
   # Follow prompts:
   # - Set root password
   # - Remove anonymous users: Y
   # - Disallow root login remotely: Y
   # - Remove test database: Y
   # - Reload privilege tables: Y
   ```

2. **Add to PATH:**
   ```bash
   echo 'export PATH="/opt/homebrew/opt/mysql@8.0/bin:$PATH"' >> ~/.zshrc
   source ~/.zshrc
   ```

3. **Verify Installation:**
   ```bash
   mysql --version
   mysql -u root -p
   ```

#### Linux (Ubuntu/Debian)

1. **Install MySQL:**
   ```bash
   # Update package index
   sudo apt update
   
   # Install MySQL Server
   sudo apt install mysql-server -y
   
   # Start MySQL service
   sudo systemctl start mysql
   
   # Enable auto-start on boot
   sudo systemctl enable mysql
   ```

2. **Secure Installation:**
   ```bash
   sudo mysql_secure_installation
   # Follow prompts to set root password and secure installation
   ```

3. **Verify Installation:**
   ```bash
   mysql --version
   sudo mysql -u root -p
   ```

---

### Redis 7 Installation

#### Windows

1. **Download Redis for Windows:**
   ```
   https://github.com/tporadowski/redis/releases
   ```
   - Download: Redis-x64-7.0.15.zip

2. **Extract and Install:**
   ```powershell
   # Extract to C:\Redis
   # Navigate to directory
   cd C:\Redis
   
   # Install as Windows service
   redis-server --service-install redis.windows.conf
   
   # Start Redis service
   redis-server --service-start
   ```

3. **Verify Installation:**
   ```powershell
   redis-cli ping
   # Expected: PONG
   ```

#### macOS

1. **Using Homebrew:**
   ```bash
   # Install Redis
   brew install redis
   
   # Start Redis service
   brew services start redis
   ```

2. **Verify Installation:**
   ```bash
   redis-cli ping
   # Expected: PONG
   ```

#### Linux (Ubuntu/Debian)

1. **Install Redis:**
   ```bash
   # Add Redis repository
   sudo add-apt-repository ppa:redislabs/redis -y
   sudo apt update
   
   # Install Redis
   sudo apt install redis -y
   
   # Start Redis service
   sudo systemctl start redis-server
   sudo systemctl enable redis-server
   ```

2. **Verify Installation:**
   ```bash
   redis-cli ping
   # Expected: PONG
   
   redis-server --version
   ```

---

### Maven Installation

#### Windows

1. **Download Maven:**
   ```
   https://maven.apache.org/download.cgi
   ```
   - Download: apache-maven-3.9.6-bin.zip

2. **Extract and Configure:**
   ```powershell
   # Extract to C:\Program Files\Apache\maven
   
   # Set environment variables
   [System.Environment]::SetEnvironmentVariable("MAVEN_HOME", "C:\Program Files\Apache\maven", "Machine")
   [System.Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\Program Files\Apache\maven\bin", "Machine")
   ```

3. **Verify Installation:**
   ```powershell
   mvn -version
   # Expected: Apache Maven 3.9.6
   ```

#### macOS

1. **Using Homebrew:**
   ```bash
   brew install maven
   ```

2. **Verify Installation:**
   ```bash
   mvn -version
   ```

#### Linux (Ubuntu/Debian)

1. **Install Maven:**
   ```bash
   sudo apt update
   sudo apt install maven -y
   ```

2. **Verify Installation:**
   ```bash
   mvn -version
   ```

---

### IDE Setup

#### Visual Studio Code

1. **Download and Install VS Code:**
   ```
   https://code.visualstudio.com/download
   ```

2. **Install Required Extensions:**
   ```json
   {
     "recommendations": [
       "vscjava.vscode-java-pack",
       "vmware.vscode-spring-boot",
       "vscjava.vscode-spring-initializr",
       "vscjava.vscode-spring-boot-dashboard",
       "pivotal.vscode-boot-dev-pack",
       "gabrielbb.vscode-lombok",
       "redhat.java",
       "vscjava.vscode-maven",
       "ms-azuretools.vscode-docker"
     ]
   }
   ```

3. **Configure Java in VS Code:**
   - Open Settings (Ctrl+,)
   - Search for "java.home"
   - Set to Java 21 installation path

4. **Install Extensions via Command Palette:**
   ```
   Ctrl+Shift+P → Extensions: Install Extensions
   ```
   - Extension Pack for Java
   - Spring Boot Extension Pack
   - Lombok Annotations Support

#### IntelliJ IDEA

1. **Download IntelliJ IDEA:**
   ```
   https://www.jetbrains.com/idea/download/
   ```
   - Community Edition (Free) or Ultimate (Paid)

2. **Configure Java SDK:**
   - File → Project Structure → SDKs
   - Add JDK → Select Java 21 directory

3. **Install Required Plugins:**
   - File → Settings → Plugins
   - Install:
     - Spring Boot
     - Lombok
     - Database Navigator
     - Docker

4. **Import Maven Project:**
   - File → Open → Select pom.xml
   - Enable "Auto-import" for Maven

---

## 🗄️ Database Setup

### Step 1: Create Database

**Using MySQL Command Line:**

```sql
-- Connect to MySQL
mysql -u root -p
-- Enter password when prompted

-- Create database
CREATE DATABASE labtestbooking CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user
CREATE USER 'labuser'@'localhost' IDENTIFIED BY 'Lab@2024Pass';

-- Grant privileges
GRANT ALL PRIVILEGES ON labtestbooking.* TO 'labuser'@'localhost';

-- Flush privileges
FLUSH PRIVILEGES;

-- Verify database creation
SHOW DATABASES;

-- Use database
USE labtestbooking;

-- Exit MySQL
EXIT;
```

**Using MySQL Workbench:**

1. Open MySQL Workbench
2. Connect to MySQL Server (localhost:3306)
3. Click "Create Schema" button
4. Enter schema name: `labtestbooking`
5. Set charset: `utf8mb4`, collation: `utf8mb4_unicode_ci`
6. Click "Apply"

### Step 2: Run Schema Script

The application will automatically create tables using JPA/Hibernate, but you can also manually run the schema:

```bash
# Navigate to project directory
cd "d:\CU\SEM 6\EPAM\PROJECT"

# Run schema script
mysql -u labuser -p labtestbooking < src/main/resources/schema.sql
```

**Or using MySQL Workbench:**
1. Open `src/main/resources/schema.sql`
2. Execute SQL script

### Step 3: Verify Tables

```sql
-- Connect to database
mysql -u labuser -p labtestbooking

-- Show all tables
SHOW TABLES;

-- Expected tables:
-- +---------------------------+
-- | Tables_in_labtestbooking  |
-- +---------------------------+
-- | audit_logs                |
-- | bookings                  |
-- | family_members            |
-- | health_scores             |
-- | lab_partners              |
-- | lab_test_pricing          |
-- | lab_tests                 |
-- | location_pricing          |
-- | notifications             |
-- | package_tests             |
-- | payments                  |
-- | recommendations           |
-- | reference_ranges          |
-- | report_results            |
-- | report_verifications      |
-- | reports                   |
-- | technician_assignments    |
-- | test_categories           |
-- | test_packages             |
-- | test_parameters           |
-- | users                     |
-- +---------------------------+

-- Check table structure
DESCRIBE users;
DESCRIBE lab_tests;
DESCRIBE bookings;
```

---

## ⚙️ Application Configuration

### Step 1: Navigate to Project

```bash
cd "d:\CU\SEM 6\EPAM\PROJECT"
```

### Step 2: Configure application.properties

Edit `src/main/resources/application.properties`:

```properties
# ============================================
# SERVER CONFIGURATION
# ============================================
server.port=8080
server.servlet.context-path=/
server.error.include-message=always
server.error.include-binding-errors=always

# ============================================
# DATABASE CONFIGURATION
# ============================================
spring.datasource.url=jdbc:mysql://localhost:3306/labtestbooking?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=labuser
spring.datasource.password=Lab@2024Pass
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# Connection Pool (HikariCP)
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=30000
spring.datasource.hikari.idle-timeout=600000
spring.datasource.hikari.max-lifetime=1800000

# ============================================
# JPA / HIBERNATE CONFIGURATION
# ============================================
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
spring.jpa.properties.hibernate.jdbc.batch_size=20
spring.jpa.properties.hibernate.order_inserts=true
spring.jpa.properties.hibernate.order_updates=true
spring.jpa.properties.hibernate.enable_lazy_load_no_trans=false

# ============================================
# REDIS CONFIGURATION
# ============================================
spring.data.redis.host=localhost
spring.data.redis.port=6379
spring.data.redis.password=
spring.data.redis.timeout=60000
spring.cache.type=redis
spring.cache.redis.time-to-live=3600000

# ============================================
# JWT CONFIGURATION
# ============================================
jwt.secret=YourSuperSecretKeyForJWTTokenGenerationMustBe256BitsLongForHS512Algorithm
jwt.expiration=86400000
jwt.refresh-expiration=604800000

# ============================================
# EMAIL CONFIGURATION (Gmail SMTP)
# ============================================
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-specific-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true

# ============================================
# FILE UPLOAD CONFIGURATION
# ============================================
spring.servlet.multipart.enabled=true
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
file.upload.directory=./uploads/

# ============================================
# ACTUATOR CONFIGURATION
# ============================================
management.endpoints.web.exposure.include=health,info,metrics,prometheus
management.endpoint.health.show-details=always
management.health.redis.enabled=true
management.health.db.enabled=true

# ============================================
# LOGGING CONFIGURATION
# ============================================
logging.level.root=INFO
logging.level.com.healthcare.labtestbooking=DEBUG
logging.level.org.springframework.web=DEBUG
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE
logging.file.name=logs/application.log
logging.file.max-size=10MB
logging.file.max-history=30

# ============================================
# API DOCUMENTATION (SpringDoc OpenAPI)
# ============================================
springdoc.api-docs.path=/api-docs
springdoc.swagger-ui.path=/swagger-ui.html
springdoc.swagger-ui.enabled=true
springdoc.swagger-ui.operations-sorter=method
springdoc.swagger-ui.tags-sorter=alpha
```

### Step 3: Environment-Specific Configuration

**For Development (application-dev.properties):**

```properties
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
logging.level.com.healthcare.labtestbooking=DEBUG
```

**For Production (application-prod.properties):**

```properties
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=false
logging.level.com.healthcare.labtestbooking=INFO
jwt.secret=CHANGE_TO_SECURE_PRODUCTION_KEY_256_BITS_LONG
```

### Step 4: Set Active Profile

**Using application.properties:**
```properties
spring.profiles.active=dev
```

**Using Environment Variable:**
```bash
export SPRING_PROFILES_ACTIVE=prod
```

**Using Command Line:**
```bash
java -jar -Dspring.profiles.active=prod target/labtestbooking.jar
```

---

## 🔨 Building the Application

### Step 1: Clean Previous Builds

```bash
# Navigate to project directory
cd "d:\CU\SEM 6\EPAM\PROJECT"

# Clean Maven build
mvn clean
```

### Step 2: Compile Sources

```bash
# Compile without running tests
mvn compile

# Compile with tests
mvn test-compile
```

### Step 3: Run Tests

```bash
# Run all tests
mvn test

# Skip tests
mvn test -DskipTests

# Run specific test class
mvn test -Dtest=AuthControllerTest
```

### Step 4: Package Application

```bash
# Create JAR file
mvn package

# Create JAR and skip tests
mvn package -DskipTests

# Expected output:
# [INFO] Building jar: target/lab-test-booking-0.0.1-SNAPSHOT.jar
# [INFO] BUILD SUCCESS
```

### Step 5: Install to Local Repository

```bash
# Install to ~/.m2/repository
mvn install
```

---

## ▶️ Running the Application

### Method 1: Using Maven (Development)

```bash
# Run using Spring Boot Maven plugin
mvn spring-boot:run

# Run with specific profile
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Run with debug mode
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=5005"
```

### Method 2: Using JAR File

```bash
# Build JAR first
mvn clean package -DskipTests

# Run JAR
java -jar target/lab-test-booking-0.0.1-SNAPSHOT.jar

# Run with profile
java -jar -Dspring.profiles.active=prod target/lab-test-booking-0.0.1-SNAPSHOT.jar

# Run with custom port
java -jar -Dserver.port=9090 target/lab-test-booking-0.0.1-SNAPSHOT.jar
```

### Method 3: Using IDE

**Visual Studio Code:**
1. Open project folder
2. Open `LabTestBookingApplication.java`
3. Click "Run" or "Debug" button
4. Or press F5

**IntelliJ IDEA:**
1. Open project
2. Locate `LabTestBookingApplication.java`
3. Right-click → Run 'LabTestBookingApplication'
4. Or click green play button

### Step 6: Verify Application is Running

```bash
# Check health endpoint
curl http://localhost:8080/actuator/health

# Expected response:
# {"status":"UP"}

# Access Swagger UI
# Open browser: http://localhost:8080/swagger-ui.html

# Test API endpoint
curl http://localhost:8080/api/tests

# Check application logs
tail -f logs/application.log
```

**Application Startup Indicators:**

```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::               (v3.2.2)

2026-02-18 10:00:00.123  INFO --- [main] c.h.l.LabTestBookingApplication : Starting LabTestBookingApplication
2026-02-18 10:00:05.456  INFO --- [main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat started on port(s): 8080 (http)
2026-02-18 10:00:05.789  INFO --- [main] c.h.l.LabTestBookingApplication : Started LabTestBookingApplication in 5.666 seconds
```

---

## 📊 Data Initialization

### Method 1: Using Data Initialization Scripts

The project includes data initialization scripts in `/docs` folder:

```bash
# Follow the comprehensive data initialization guide
# See: ../guide/DATA_INITIALIZATION_GUIDE.md
# Or: ../guide/QUICK_START_DATA_INIT.md
```

### Method 2: Using SQL Scripts

```sql
-- Connect to database
mysql -u labuser -p labtestbooking

-- Insert sample users
INSERT INTO users (email, password, full_name, phone_number, role, date_of_birth, gender, is_active, created_at)
VALUES 
('admin@labtest.com', '$2a$10$hashedpassword', 'Admin User', '+1234567890', 'ADMIN', '1985-01-01', 'MALE', true, NOW()),
('patient@labtest.com', '$2a$10$hashedpassword', 'John Doe', '+1234567891', 'PATIENT', '1990-06-15', 'MALE', true, NOW());

-- Insert sample lab tests
INSERT INTO lab_tests (name, code, category, description, base_price, discount, discounted_price, report_time, report_time_unit, gender, is_active, created_at)
VALUES 
('Complete Blood Count (CBC)', 'TEST_CBC_001', 'Hematology', 'Comprehensive blood test', 500.00, 10, 450.00, 24, 'HOURS', 'BOTH', true, NOW()),
('Lipid Profile', 'TEST_LIPID_001', 'Cardiovascular', 'Cholesterol and lipids test', 800.00, 15, 680.00, 24, 'HOURS', 'BOTH', true, NOW()),
('Thyroid Profile', 'TEST_THYROID_001', 'Endocrinology', 'T3, T4, TSH levels', 900.00, 10, 810.00, 48, 'HOURS', 'BOTH', true, NOW());

-- Verify data
SELECT * FROM users;
SELECT * FROM lab_tests;
```

### Method 3: Using API Endpoints

```bash
# Register admin user
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@labtest.com",
    "password": "Admin123!",
    "fullName": "Admin User",
    "phoneNumber": "+1234567890",
    "role": "ADMIN",
    "dateOfBirth": "1985-01-01",
    "gender": "MALE"
  }'

# Login to get token
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@labtest.com",
    "password": "Admin123!"
  }'

# Use token to add lab tests
curl -X POST http://localhost:8080/api/admin/tests \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Complete Blood Count (CBC)",
    "code": "TEST_CBC_001",
    "category": "Hematology",
    "basePrice": 500.00,
    "discount": 10
  }'
```

---

## 🐳 Docker Setup

### Step 1: Install Docker

**Windows:**
```
https://docs.docker.com/desktop/install/windows-install/
```

**macOS:**
```bash
brew install --cask docker
```

**Linux:**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

### Step 2: Build Docker Image

```bash
# Navigate to project directory
cd "d:\CU\SEM 6\EPAM\PROJECT"

# Build image
docker build -t lab-test-booking:1.0 .

# Verify image
docker images | grep lab-test-booking
```

### Step 3: Run with Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  # MySQL Database
  mysql:
    image: mysql:8.0
    container_name: lab-mysql
    environment:
      MYSQL_ROOT_PASSWORD: root123
      MYSQL_DATABASE: labtestbooking
      MYSQL_USER: labuser
      MYSQL_PASSWORD: Lab@2024Pass
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql
      - ./src/main/resources/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    networks:
      - lab-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: lab-redis
    ports:
      - "6379:6379"
    networks:
      - lab-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  # Spring Boot Application
  app:
    build: .
    container_name: lab-app
    ports:
      - "8080:8080"
    environment:
      SPRING_PROFILES_ACTIVE: prod
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/labtestbooking?useSSL=false&serverTimezone=UTC
      SPRING_DATASOURCE_USERNAME: labuser
      SPRING_DATASOURCE_PASSWORD: Lab@2024Pass
      SPRING_DATA_REDIS_HOST: redis
      SPRING_DATA_REDIS_PORT: 6379
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - lab-network
    restart: unless-stopped

networks:
  lab-network:
    driver: bridge

volumes:
  mysql-data:
```

**Run Docker Compose:**

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

---

## 🚀 Production Deployment

### Step 1: Build Production JAR

```bash
# Set production profile
export SPRING_PROFILES_ACTIVE=prod

# Build with production settings
mvn clean package -DskipTests -Pprod

# Verify JAR
ls -lh target/*.jar
```

### Step 2: Configure Production Environment

```bash
# Create production config directory
mkdir -p /opt/labtest/config

# Copy application.properties
cp src/main/resources/application-prod.properties /opt/labtest/config/

# Set secure JWT secret
# Generate random 256-bit key
openssl rand -base64 32

# Update application-prod.properties with secure values
```

### Step 3: Run as System Service (Linux)

Create `/etc/systemd/system/labtest.service`:

```ini
[Unit]
Description=Lab Test Booking Application
After=syslog.target network.target mysql.service redis.service

[Service]
User=labtest
Group=labtest
WorkingDirectory=/opt/labtest
ExecStart=/usr/bin/java -jar /opt/labtest/lab-test-booking.jar --spring.config.location=/opt/labtest/config/application-prod.properties
SuccessExitStatus=143
StandardOutput=journal
StandardError=journal
SyslogIdentifier=labtest
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Enable and start service:**

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service
sudo systemctl enable labtest

# Start service
sudo systemctl start labtest

# Check status
sudo systemctl status labtest

# View logs
sudo journalctl -u labtest -f
```

### Step 4: Configure Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name api.labtestbooking.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Step 5: Setup SSL with Let's Encrypt

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d api.labtestbooking.com

# Auto-renewal (cron job)
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 🔍 Troubleshooting

### Issue 1: MySQL Connection Failed

**Error:**
```
Communications link failure
```

**Solutions:**
```bash
# Check MySQL service status
sudo systemctl status mysql

# Restart MySQL
sudo systemctl restart mysql

# Test connection
mysql -u labuser -p -h localhost labtestbooking

# Check firewall
sudo ufw allow 3306
```

### Issue 2: Redis Connection Timeout

**Error:**
```
Unable to connect to Redis
```

**Solutions:**
```bash
# Check Redis status
redis-cli ping

# Restart Redis
sudo systemctl restart redis

# Check Redis config
redis-cli config get bind
redis-cli config get protected-mode
```

### Issue 3: Port Already in Use

**Error:**
```
Port 8080 is already in use
```

**Solutions:**
```bash
# Windows: Find process using port
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/Mac: Find and kill process
lsof -ti:8080 | xargs kill -9

# Or change application port
java -jar -Dserver.port=9090 target/lab-test-booking.jar
```

### Issue 4: OutOfMemoryError

**Error:**
```
java.lang.OutOfMemoryError: Java heap space
```

**Solutions:**
```bash
# Increase JVM heap size
java -Xms512m -Xmx2048m -jar target/lab-test-booking.jar

# For production
java -XX:+UseG1GC -Xms1g -Xmx4g -jar lab-test-booking.jar
```

### Issue 5: JWT Token Invalid

**Solutions:**
1. Ensure JWT secret is properly configured
2. Check token expiration time
3. Verify token format (Bearer prefix)
4. Clear Redis cache: `redis-cli FLUSHALL`

---

## 📚 Next Steps

After successful setup:

1. **Explore API Documentation:**
   - Open Swagger UI: http://localhost:8080/swagger-ui.html
   - Read [API Documentation](../api/API.md)

2. **Initialize Sample Data:**
   - Follow [Data Initialization Guide](../guide/DATA_INITIALIZATION_GUIDE.md)
   - Or use [Quick Start Data Init](../guide/QUICK_START_DATA_INIT.md)

3. **Review Features:**
   - Read [Complete Features Guide](../overview/FEATURES.md)
   - Understand [System Architecture](../architecture/SYSTEM_ARCHITECTURE.md)

4. **Set Up Monitoring:**
   - Configure Actuator endpoints
   - Set up Prometheus metrics
   - Configure log aggregation

5. **Configure Integrations:**
   - Email service (SMTP)
   - SMS gateway (Twilio)
   - Payment gateway (Razorpay/Stripe)

6. **Run Load Tests:**
   - See `../../load-test/README.md`
   - Configure JMeter tests

---

**Setup Complete! 🎉**

Your Healthcare Lab Test Booking System is now ready for development or production use.

**Support:** For issues or questions, refer to [Troubleshooting](PROJECT_OVERVIEW.md#troubleshooting) or contact support@labtestbooking.com

---

**Last Updated:** February 18, 2026
