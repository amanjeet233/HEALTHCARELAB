# Quick Reference: API Testing Commands

## 1. Register a Patient
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Test@1234",
    "phone": "+1234567890",
    "role": "PATIENT"
  }'
```

## 2. Login
```bash
# For Patient
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Test@1234"
  }'
```

## 3. Save Token (in terminal)
```bash
# After login, copy the token from response
TOKEN="your_jwt_token_here"

# Or Linux/Mac
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"Test@1234"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo $TOKEN
```

## 4. Get User Profile (Protected)
```bash
curl -X GET http://localhost:8080/api/users/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

## 5. Get All Bookings
```bash
curl -X GET http://localhost:8080/api/bookings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

## 6. Create a Booking
```bash
curl -X POST http://localhost:8080/api/bookings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "testId": 1,
    "bookingDate": "2024-04-20",
    "slotId": 1,
    "notes": "Annual checkup"
  }'
```

## 7. Get Available Slots (Public)
```bash
curl -X GET http://localhost:8080/api/bookings/slots
```

## 8. Get Lab Tests
```bash
curl -X GET http://localhost:8080/api/lab-tests \
  -H "Authorization: Bearer $TOKEN"
```

## 9. Get My Reports
```bash
curl -X GET http://localhost:8080/api/reports/my \
  -H "Authorization: Bearer $TOKEN"
```

## 10. Refresh Token
```bash
curl -X POST http://localhost:8080/api/auth/refresh-token \
  -H "Authorization: Bearer $TOKEN"
```

## 11. Logout
```bash
curl -X POST http://localhost:8080/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

## 12. Health Check
```bash
curl http://localhost:8080/actuator/health
```

## PowerShell Version

```powershell
# Set token variable
$TOKEN = "your_jwt_token_here"

# Get user profile
curl.exe -X GET "http://localhost:8080/api/users/profile" `
  -H "Authorization: Bearer $TOKEN" `
  -H "Content-Type: application/json"

# Get bookings
curl.exe -X GET "http://localhost:8080/api/bookings" `
  -H "Authorization: Bearer $TOKEN" `
  -H "Content-Type: application/json"
```

## cURL Useful Options

```bash
# Pretty print JSON output
curl ... | json_pp

# Save response to file
curl ... -o response.json

# Show headers in response
curl -i ...

# Verbose output (see all details)
curl -v ...

# Include cookies
curl -b cookies.txt ...

# Save cookies
curl -c cookies.txt ...

# Set custom header
curl -H "X-Custom-Header: value" ...
```

## Common Headers

```bash
# Authorization
-H "Authorization: Bearer $TOKEN"

# Content Type
-H "Content-Type: application/json"

# Accept
-H "Accept: application/json"

# Pagination
-H "X-Page: 1"
-H "X-Page-Size: 10"
```

## Response Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | OK | Request successful |
| 201 | Created | Resource created |
| 400 | Bad Request | Check payload |
| 401 | Unauthorized | Check token |
| 403 | Forbidden | Check role permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Check server logs |

## Debugging Tips

```bash
# Check if server is running
ping localhost:8080

# Check port usage
lsof -i :8080          # macOS/Linux
netstat -ano | grep 8080  # Windows

# View server logs
tail -f logs/application.log

# Decode JWT token (linux)
echo $TOKEN | cut -d'.' -f2 | base64 -d | jq .

# Check MySQL running
mysql -u root -p -e "SELECT 1"

# Check firewall (Windows)
netsh advfirewall show allprofiles
```

## Testing Workflow

```bash
# 1. Register
curl -X POST http://localhost:8080/api/auth/register ...

# 2. Login and save token
TOKEN=$(curl -s -X POST ... | grep token)

# 3. Test with token
curl -H "Authorization: Bearer $TOKEN" ...

# 4. Test without token (should fail)
curl http://localhost:8080/api/users/profile

# 5. Check health
curl http://localhost:8080/actuator/health
```

**Pro Tip:** Create a shell script or batch file to automate these steps! 🚀
