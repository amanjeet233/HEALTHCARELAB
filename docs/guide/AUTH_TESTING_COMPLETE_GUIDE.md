# Healthcare Lab Test Booking API - Complete Testing Guide

## Quick Start Testing

### Prerequisites
1. ✅ Backend running on `http://localhost:8080`
2. ✅ MySQL database configured and running
3. ✅ Postman or curl installed

---

## Method 1: Using Automated Scripts (Easiest)

### Windows (PowerShell / CMD)
```bash
cd d:\CU\SEM 6\EPAM\PROJECT
.\test-auth-api.bat
```

### Linux / macOS / WSL
```bash
cd "d:/CU/SEM 6/EPAM/PROJECT"
chmod +x test-auth-api.sh
./test-auth-api.sh
```

---

## Method 2: Manual Testing with CURL

### 1️⃣ Register a New User

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "Password@123",
    "phone": "+1234567890",
    "gender": "MALE",
    "role": "PATIENT"
  }'
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "userId": 1,
    "email": "john.doe@example.com",
    "name": "John Doe",
    "role": "PATIENT",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2️⃣ Login with Credentials

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "Password@123"
  }'
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "userId": 1,
    "email": "john.doe@example.com",
    "name": "John Doe",
    "role": "PATIENT",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqb2huLmRvZUBleGFtcGxlLmNvbSIsImlhdCI6MTcxMzEwMDEyMywiZXhwIjoxNzEzMTg2NTIzfQ..."
  }
}
```

**💡 Save the token for next requests!**

### 3️⃣ Access Protected Endpoint (with Token)

```bash
# Set your token
TOKEN="YOUR_JWT_TOKEN_HERE"

# Get user profile
curl -X GET http://localhost:8080/api/users/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "userId": 1,
    "email": "john.doe@example.com",
    "name": "John Doe",
    "phone": "+1234567890",
    "role": "PATIENT",
    "isActive": true
  }
}
```

### 4️⃣ Try Protected Endpoint WITHOUT Token (Error Test)

```bash
curl -X GET http://localhost:8080/api/users/profile \
  -H "Content-Type: application/json"
```

**Expected Response (401):**
```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "Full authentication is required to access this resource"
}
```

### 5️⃣ Access Public Endpoint (No Token Needed)

```bash
# Get available booking slots
curl -X GET http://localhost:8080/api/bookings/slots \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": [
    {
      "slotId": 1,
      "startTime": "09:00",
      "endTime": "10:00",
      "available": true,
      "date": "2024-04-15"
    }
  ]
}
```

---

## Method 3: Using Postman

### Import Collection
1. Open Postman
2. Click **Import** → **Upload Files**
3. Select: `Healthcare Lab Test Booking API - Working.postman_collection.json`
4. Select environment: `Healthcare Local.postman_environment.json`

### Test Order
```
1. Auth → Register
   ↓
2. Auth → Login (Copy token here!)
   ↓
3. Users → Get Profile (Paste token in Authorization tab)
   ↓
4. Bookings → Get All Bookings
   ↓
5. Reports → Get Reports (if TECHNICIAN role)
```

---

## Environment Variables Setup

**In Postman "Healthcare Local" Environment:**

| Variable | Value | Usage |
|----------|-------|-------|
| `base_url` | `http://localhost:8080/api` | Base API URL |
| `token` | `(Auto-set after login)` | JWT Token |
| `patient_email` | `john@example.com` | Test email |
| `doctor_email` | `doctor@example.com` | Doctor test |

### Auto-set Token (Postman)
After login request, use this in **Tests** tab:
```javascript
if (pm.response.code === 200) {
    const data = pm.response.json();
    pm.environment.set('token', data.data.token);
}
```

---

## Role-Based Access Tests

### 👤 Patient Role
**Can access:**
- ✅ `/api/users/profile`
- ✅ `/api/bookings/my`
- ✅ `/api/reports/my`
- ✅ `/api/bookings` (GET)

**Cannot access:**
- ❌ `/api/admin/**`
- ❌ `/api/reports/results` (TECHNICIAN only)

### 👨‍⚕️ Doctor Role
**Can access:**
- ✅ `/api/doctor/**`
- ✅ `/api/reports/**`
- ✅ `/api/patients/**`

### 👩‍🔬 Technician Role
**Can access:**
- ✅ `/api/technician/**`
- ✅ `/api/reports/results`
- ✅ `/api/orders/**`

### 👨‍💼 Admin Role
**Can access:**
- ✅ `/api/admin/**`
- ✅ All endpoints

---

## Common Error Responses

### 400 - Bad Request
```json
{
  "status": 400,
  "error": "Invalid input",
  "message": "Email is required"
}
```
**Fix:** Check request payload fields

### 401 - Unauthorized
```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid token"
}
```
**Fix:** 
- Check if token is passed in `Authorization: Bearer <token>` header
- Token may be expired (valid for 24 hours)
- Re-login to get new token

### 403 - Forbidden
```json
{
  "status": 403,
  "error": "Access Denied",
  "message": "You don't have permission to access this resource"
}
```
**Fix:** Change to correct role or endpoint

### 404 - Not Found
```json
{
  "status": 404,
  "error": "Not Found",
  "message": "User not found"
}
```
**Fix:** Check if resource exists

### 500 - Server Error
```json
{
  "status": 500,
  "error": "Internal Server Error",
  "message": "Database connection failed"
}
```
**Fix:** Check server logs and database connection

---

## Troubleshooting Checklist

- [ ] Backend running on port 8080?
  ```bash
  netstat -ano | findstr :8080
  ```
  
- [ ] MySQL running?
  ```bash
  mysql -u root -p -e "SELECT VERSION();"
  ```

- [ ] Database `labtestbooking` exists?
  ```bash
  mysql -u root -p -e "SHOW DATABASES;"
  ```

- [ ] User table has data?
  ```bash
  mysql -u root -p labtestbooking -e "SELECT * FROM users;"
  ```

- [ ] Check server logs for JWT errors:
  ```bash
  tail -f logs/application.log | grep -i jwt
  ```

- [ ] Validate token format (should start with `eyJ`):
  ```bash
  echo "YOUR_TOKEN" | cut -c1-5
  ```

---

## Token Validation Tool

Decode your JWT online (for debugging):
- https://jwt.io

Copy your token there to see:
- Expiration time
- User email (subject)
- Roles (claims)
- Signature validity

---

## Performance Testing

### Load Testing (Optional)
```bash
# Using Apache Bench
ab -n 100 -c 10 http://localhost:8080/api/bookings/slots

# Using wrk
wrk -t4 -c100 -d30s http://localhost:8080/api/bookings/slots
```

---

## Summary

| Step | Command | Expected |
|------|---------|----------|
| 1 | Register user | 201 Created + Token |
| 2 | Login | 200 OK + Token |
| 3 | Get Profile | 200 OK + User Data |
| 4 | No Token | 401 Unauthorized |
| 5 | Public Endpoint | 200 OK + Data |

✅ **If all tests pass, authentication is working correctly!**
