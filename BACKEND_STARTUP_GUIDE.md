# 🔧 Fix: Backend Not Running - "Failed to Load Lab Tests"

## Problem
```
Error: Failed to load lab tests.
```

**Root Cause:** Backend server on port 8080 is not running.

---

## ✅ Solution: Start The Backend

### Option 1: Using Maven (Recommended)

**Step 1: Open Terminal at Backend Directory**
```bash
cd d:\CU\SEM 6\SEM6PP\PROJECT\backend
```

**Step 2: Start Spring Boot Application**
```bash
# On Windows
mvnw spring-boot:run

# OR if that doesn't work
./mvnw spring-boot:run
```

**Step 3: Wait for Startup**
You should see:
```
Tomcat started on port(s): 8080 (http)
Started LabTestBookingApplication in X.XXX seconds
```

**Step 4: Verify Backend is Running**
```bash
# In another terminal, test the API
curl http://localhost:8080/api/lab-tests

# Or open in browser
http://localhost:8080/api/lab-tests/popular
```

---

### Option 2: Using IDE (IntelliJ/VS Code)

**IntelliJ IDEA:**
1. Open project in IntelliJ
2. Find `LabTestBookingApplication.java` (main class)
3. Right-click → **Run 'LabTestBookingApplication'**
4. Wait for "Spring Boot app started" message

**VS Code:**
1. Have backend folder open
2. Right-click pom.xml
3. Select "Run as Spring Boot App" (if extension installed)
4. Or use extension sidebar to run

---

### Option 3: Direct Java Command

```bash
cd d:\CU\SEM 6\SEM6PP\PROJECT\backend
mvn clean package
java -jar target/labtestbooking-1.0.0.jar
```

---

## Expected Startup Sequence

```
1️⃣  Starting Spring Boot Application...
   [INFO] LabTestBookingApplication starting...

2️⃣  Initializing Database
   [INFO] Executing Flyway migration V10__Create_Tests_Tables.sql
   [INFO] Executing Flyway migration V11__Insert_500_Tests.sql ← Tests being seeded!

3️⃣  Loading Configurations
   [INFO] Tomcat initialized with port: 8080
   [INFO] Spring Security is configured
   [INFO] OpenAPI 3.0 documentation available at http://localhost:8080/swagger-ui.html

4️⃣  Ready for Requests
   ✅ Started LabTestBookingApplication in 45.123 seconds
   ✅ Application listening on http://localhost:8080
   ✅ API endpoints alive at http://localhost:8080/api/lab-tests
```

---

## Verification: Is Backend Running?

### Method 1: Check Port
```bash
netstat -ano | findstr :8080
# Should show: LISTENING
```

### Method 2: Test API via Browser
```
http://localhost:8080/api/lab-tests/popular
```
Should return JSON with lab tests (not error page)

### Method 3: Test API via Terminal
```bash
curl -X GET http://localhost:8080/api/lab-tests
# Should return: {"data": {"content": [...]}, "status": "success"}
```

### Method 4: Check Browser Console
Open http://localhost:3007 (frontend)
- Frontend will show 200 OK responses in Network tab
- No 404 or "Failed to connect" errors

---

## Current Status

| Component | Port | Status | Action |
|-----------|------|--------|--------|
| Frontend | 3007 | ✅ Running | Visit http://localhost:3007 |
| Backend | 8080 | ❌ **NOT Running** | **START NOW** (instructions above) |
| Database | 3306 | ✅ Assumed Ready | Should auto-connect when backend starts |

---

## Quick Start Script (Windows)

Create file: `start-backend.bat`

```batch
@echo off
echo Starting Healthcare Lab Test Booking Backend...
cd backend
echo Building and starting Spring Boot application...
call mvnw spring-boot:run -Dspring-boot.run.jvmArguments="-Xmx1024m"
pause
```

Then simply double-click `start-backend.bat` to start everything!

---

## What Happens When Backend Starts

1. ✅ Flyway runs database migrations
2. ✅ 502 lab tests imported from migration
3. ✅ Spring Security configured
4. ✅ REST API endpoints registered
5. ✅ CORS configured for localhost:3007
6. ✅ Swagger documentation generated
7. ✅ Ready to serve requests

---

## After Backend is Running

### Frontend Will Automatically Load Tests

1. ✅ Refresh http://localhost:3007
2. ✅ Tests page will show all 502 lab tests
3. ✅ No more "Failed to load lab tests" error
4. ✅ Can add tests to cart
5. ✅ Can proceed to booking

---

## Troubleshooting Backend Startup

### Issue: "Address already in use :8080"
```bash
# Port 8080 is occupied by another process
# Solution 1: Kill the process
netstat -ano | findstr :8080
taskkill /PID [PID] /F

# Solution 2: Change port in application.properties
server.port=8081
```

### Issue: "MySQL connection refused"
```
Check if MySQL is running:
1. Open Services (services.msc)
2. Find "MySQL80" (or your version)
3. If stopped, right-click → Start

Or from terminal:
net start MySQL80
```

### Issue: "Database migration failed"
```
Check console output for specific error
Usually means:
1. Database doesn't exist → Create it first
2. Wrong H credentials → Fix application.properties
3. Flyway conflict → Delete V10/V11 and reapply
```

### Issue: "Port 3007 and 8080 not communicating"
```
Check CORS in LabTestController:
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://localhost:3007"})
      ↑ Ensure 3007 is in the list

If not, add it and restart backend
```

---

## Complete Working Setup

Once backend is running, you should see:

```
🔷 Frontend (http://localhost:3007)
   ├─ Tests listing page loads
   ├─ Shows 502 lab tests
   ├─ Can filter and search
   └─ Can add to cart ✅

🔶 Backend (http://localhost:8080)
   ├─ API endpoints active
   ├─ Database migrations complete
   ├─ 502 tests seeded
   └─ Ready for requests ✅

🔴 MySQL Database
   ├─ healthcare_lab database
   ├─ 10+ tables created
   ├─ 502 test records inserted
   └─ Ready for persistence ✅

🟢 System is LIVE
   └─ Ready for testing ✅
```

---

## Next Steps

1. ✅ Start backend using instructions above
2. ✅ Wait for "Started LabTestBookingApplication" message
3. ✅ Refresh http://localhost:3007
4. ✅ Verify tests load without error
5. ✅ Click "ADD" button to add test to cart
6. ✅ View cart with test details

---

## 📞 If Backend Won't Start

Check these in order:

1. **Java installed?**
   ```bash
   java -version
   # Should show Java 11 or higher
   ```

2. **Maven installed?**
   ```bash
   mvn --version
   # Should show Maven 3.6+
   ```

3. **MySQL running?**
   ```bash
   # Windows
   net start MySQL80
   ```

4. **Port 8080 free?**
   ```bash
   netstat -ano | findstr :8080
   # Should be empty
   ```

5. **Check logs in console** for specific error message

---

## ✅ Summary

**Problem:** Backend not running → Tests won't load  
**Solution:** Start backend with `mvnw spring-boot:run`  
**Result:** Tests load, cart works, system operational  

**Duration:** ~1-2 minutes for first startup (slower due to migrations)

**Command to run now:**
```bash
cd backend && mvwn spring-boot:run
```

Then refresh http://localhost:3007 and tests will appear! 🎉
