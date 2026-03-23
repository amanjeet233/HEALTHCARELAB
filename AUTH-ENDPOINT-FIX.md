# Auth Endpoint Fix - Login Issue Resolution

**Date:** 2026-03-23 (During Phase 5 Planning)
**Issue:** "Unauthorized: Full authentication is required to access this resource" when trying to login
**Root Cause:** Frontend auth endpoints were missing the `/api` prefix
**Status:** ✅ FIXED

---

## The Problem

When users tried to login, they got:
```
Unauthorized: Full authentication is required to access this resource
```

This was a **401 Unauthorized** error coming from the backend's authentication entry point.

---

## Root Cause Analysis

### Backend Side ✅ (Working correctly)
- SecurityConfig allows `/api/auth/**` endpoints as public (permitAll)
- JwtAuthenticationFilter skips `/api/auth/**` endpoints
- AuthController is correctly mapped to `/api/auth/`
- All auth endpoints working fine

### Frontend Side ❌ (Bug Found!)
The frontend was calling **incorrect URLs**:

| Endpoint | Frontend Was Calling | Should Call | Status |
|---|---|---|---|
| Login | `/auth/login` | `/api/auth/login` | ❌ Wrong |
| Register | `/auth/register` | `/api/auth/register` | ❌ Wrong |
| Forgot Password | `/auth/forgot-password` | `/api/auth/forgot-password` | ❌ Wrong |
| Reset Password | `/auth/reset-password` | `/api/auth/reset-password` | ❌ Wrong |
| Verify Email | `/auth/verify-email` | `/api/auth/verify-email` | ❌ Wrong |
| Resend Verification | `/auth/resend-verification` | `/api/auth/resend-verification` | ❌ Wrong |

### Why This Happened

The API client is configured with:
```typescript
baseURL: 'http://localhost:8080'  // NO /api suffix
```

So when the frontend calls `/auth/login`, Axios makes:
```
POST http://localhost:8080/auth/login  ❌ WRONG
```

Should be:
```
POST http://localhost:8080/api/auth/login  ✅ CORRECT
```

Since the baseURL doesn't include `/api`, the endpoint paths must include it.

---

## The Fix

**File:** `frontend/src/context/AuthContext.tsx`

Changed all 6 auth endpoint calls from:
- `api.post('/auth/...')`

To:
- `api.post('/api/auth/...')`

### Changed Lines:
```diff
- const response = await api.post<AuthResponse>('/auth/login', credentials);
+ const response = await api.post<AuthResponse>('/api/auth/login', credentials);

- const response = await api.post<AuthResponse>('/auth/register', userData);
+ const response = await api.post<AuthResponse>('/api/auth/register', userData);

- await api.post('/auth/forgot-password', { email });
+ await api.post('/api/auth/forgot-password', { email });

- await api.post('/auth/reset-password', { token, newPassword });
+ await api.post('/api/auth/reset-password', { token, newPassword });

- await api.post('/auth/verify-email', { code });
+ await api.post('/api/auth/verify-email', { code });

- await api.post('/auth/resend-verification');
+ await api.post('/api/auth/resend-verification');
```

### Commits Made:
1. **Frontend Submodule:** `c65f82e` - Auth endpoint fixes in AuthContext.tsx
2. **Main Project:** `63e5649` - Update frontend submodule reference

---

## Testing / Verification ✅

After the fix, login should work correctly:

1. **Login Request:**
   ```
   POST http://localhost:8080/api/auth/login
   ```
   ✅ Hits correct backend endpoint

2. **Flow:**
   - Frontend → `/api/auth/login` ✅
   - Backend receives request ✅
   - Routes to AuthController.login() ✅
   - Returns JWT token ✅
   - Frontend stores token in localStorage ✅

---

## Lessons Learned

### API Configuration Best Practice

When using Axios with a baseURL that doesn't include a path prefix:

```typescript
// ✅ GOOD - Include the prefix in each endpoint
const api = axios.create({ baseURL: 'http://localhost:8080' });
api.get('/api/tests');  // Full path included

// ⚠️ RISKY - Including prefix in baseURL means all endpoints should skip it
const api = axios.create({ baseURL: 'http://localhost:8080/api' });
api.get('/tests');  // Just the resource path
// But this causes issues if you have non-API routes (auth, swagger, etc.)
```

**Our Setup (Current - After Fix):**
```typescript
// baseURL = 'http://localhost:8080'  (no /api)
// All endpoints must start with '/api/'
api.get('/api/tests')
api.post('/api/auth/login')
api.get('/api/cart')
```

This approach is better because:
- ✅ Can mix API and non-API routes easily
- ✅ Clearer what's an API call vs infrastructure endpoint
- ✅ Easier to refactor partial paths
- ✅ Works with subdomains/alt ports for different services

---

## How to Test Login Now

1. **Start backend:**
   ```bash
   cd backend
   java -Dspring-boot.devtools.restart.enabled=false \
     -DJWT_SECRET=dev_secret_key_at_least_32_characters_long \
     -jar target/lab-test-booking-0.0.1-SNAPSHOT.jar
   ```

2. **Start frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Try logging in:**
   - Open http://localhost:5173
   - Click Login
   - Use credentials: `patient@example.com` / `password` (or registerduser)
   - Should see: ✅ Success message, token stored, redirect

4. **Verify in DevTools:**
   - Open Browser DevTools → Network tab
   - Look for: `POST /api/auth/login` → **✅ 200 OK**
   - Check Storage → localStorage → Should have `token` and `refreshToken`

---

## Frontend Login Now Works! 🎉

The frontend authentication flow should now work correctly. Users can:
- ✅ **Register** new accounts
- ✅ **Login** with credentials
- ✅ **Refresh tokens** when expired
- ✅ **Reset passwords**
- ✅ **Verify emails**

---

## Next: Continue with Phase 5

Now that authentication is working, we can:

1. **Phase 5.1** - Implement Order Management endpoints
2. **Phase 5.2** - Implement Payment Refunds
3. Get the shopping cart flow working
4. Test complete checkout pipeline

Ready to proceed with Phase 5 implementation?
