# Postman Testing Guide - Updated for JWT Authentication

## 📥 Import the Collections

### Step 1: Open Postman
- Download and install [Postman](https://www.postman.com/downloads/)

### Step 2: Import Environment
1. Click **Import** button (top-left)
2. Select **Upload Files**
3. Choose: `Healthcare Local.postman_environment.json`
4. Click **Import**

### Step 3: Import Collections
Choose ONE to import:

**Option A: New Complete Auth Testing** (Recommended)
- File: `postman/Auth-Testing-Collection.postman_collection.json`
- Best for: Testing authentication flow

**Option B: Full API Collection**
- File: `Healthcare Lab Test Booking API - Working.postman_collection.json`
- Best for: Complete API testing

---

## 🔧 Configure Environment

1. In Postman top-right, select environment: **Healthcare Local**
2. Click **Environment** icon
3. Update these values if needed:

| Variable | Current Value | Purpose |
|----------|---------------|---------|
| `base_url` | http://localhost:8080 | Server base URL |
| `api_url` | http://localhost:8080/api | API endpoint |
| `patient_email` | patient@example.com | Test patient email |
| `patient_password` | Test@1234 | Test patient password |

---

## 🚀 Quick Testing Flow

### Flow 1: Register → Login → Access Protected Endpoint

**Step 1: Register Patient**
- Open: **Authentication → 1. Register Patient**
- Click **Send**
- ✅ Should return `200/201` with token

**Step 2: Login Patient**
- Open: **Authentication → 2. Login Patient**
- Click **Send**
- ✅ Token automatically saved to `patient_token` variable
- ✓ Look for **Test Results** on right showing "✓ Response has valid token"

**Step 3: Access Protected Endpoint**
- Open: **Protected Endpoints → Get User Profile**
- Click **Send**
- ✅ Should return `200` with user data
- Token automatically used from environment!

### Flow 2: Verify Error Handling

**Test 1: No Token (401)**
- Open: **Error Tests → Access Protected Endpoint WITHOUT TOKEN**
- Click **Send**
- ✅ Should return `401 Unauthorized`

**Test 2: Invalid Password (400/401)**
- Open: **Error Tests → Login with INVALID PASSWORD**
- Click **Send**
- ✅ Should return error

**Test 3: Non-existent User (404)**
- Open: **Error Tests → Login with NON-EXISTENT USER**
- Click **Send**
- ✅ Should return `404 Not Found`

**Test 4: Invalid Token (401)**
- Open: **Error Tests → Invalid/Expired TOKEN**
- Click **Send**
- ✅ Should return `401 Unauthorized`

---

## 📋 All Available Endpoints

### 🔐 Authentication (Public)
```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login user
GET    /api/auth/validate          - Validate JWT token
POST   /api/auth/refresh-token     - Refresh JWT token
```

### 👤 Protected Endpoints (Require Token)
```
GET    /api/users/profile          - Get user profile
GET    /api/bookings               - Get all bookings
GET    /api/bookings/my            - Get my bookings
GET    /api/lab-tests              - Get lab tests
GET    /api/reports/my             - Get my reports
```

### 🌐 Public Endpoints (No Token)
```
GET    /api/bookings/slots         - Get available slots
GET    /actuator/health            - Health check
```

---

## 🧪 Test Results Interpretation

### ✅ Green Badge = Test Passed
```
✓ Status code is 200
✓ Response has token
✓ Response has user data
```

### ❌ Red Badge = Test Failed
Check:
1. Backend running on :8080?
2. Database connected?
3. Token valid?
4. User exists in database?

---

## 💾 Saving Tokens

Tokens are **automatically saved** to environment when you:

1. **Run Register endpoint** → `patient_token` set
2. **Run Login endpoint** → `patient_token` updated
3. **Run Refresh Token endpoint** → `patient_token` refreshed

View saved token:
- Click **Environment** icon (top-right)
- Look for `patient_token` value

---

## 🔄 Create Multiple User Roles

### Register Different Roles

**1. Register Technician:**
```json
{
  "name": "Tech User",
  "email": "technician@example.com",
  "password": "Test@1234",
  "phone": "+1234567890",
  "role": "TECHNICIAN"
}
```

**2. Register Doctor:**
```json
{
  "name": "Doctor",
  "email": "doctor@example.com",
  "password": "Test@1234",
  "phone": "+9876543210",
  "role": "DOCTOR"
}
```

**3. Register Admin:**
```json
{
  "name": "Admin",
  "email": "admin@example.com",
  "password": "Test@1234",
  "phone": "+1111111110",
  "role": "ADMIN"
}
```

Then save their tokens to environment variables:
- `technician_token`
- `doctor_token`
- `admin_token`

---

## 🐛 Troubleshooting

### Problem: "Connection refused"
**Fix:**
```bash
# Check if server is running
netstat -ano | findstr :8080

# If not, start backend
d:\CU\SEM 6\EPAM\PROJECT\start-backend.bat
```

### Problem: "User not found"
**Fix:**
1. Delete user from database manually (if needed)
2. Run Register endpoint with different email
3. Make sure email in request matches environment variable

### Problem: Token shows empty ""
**Fix:**
1. Run Login endpoint (not Register)
2. Check response has "token" field
3. Look at Test Results tab for error messages

### Problem: "Invalid token" error
**Fix:**
1. Token is **case-sensitive**
2. Token expires after 24 hours
3. Re-login to get new token
4. Make sure "Bearer" is included in header

---

## 📊 Running Postman Collections (Automated)

### Run Full Suite
1. Right-click collection name
2. Click **Run collection**
3. Select environment
4. Click **Run Auth-Testing-Collection**

### View Summary
- Passed tests ✅
- Failed tests ❌
- Response times
- Full logs

---

## 🔗 Integration with CI/CD

```bash
# Run Postman collection via CLI (newman)
npm install -g newman

# Run collection
newman run Auth-Testing-Collection.postman_collection.json \
  -e "Healthcare Local.postman_environment.json" \
  --reporters cli,json \
  --reporter-json-export results.json
```

---

## 📝 Notes

- **All passwords**: `Test@1234`
- **Token validity**: 24 hours
- **Token format**: JWT (starts with `eyJ`)
- **Authentication header**: `Authorization: Bearer <token>`
- **Content-Type**: Always `application/json`

✅ **Ready to test!** Import the collection and start with Step 1! 🚀
