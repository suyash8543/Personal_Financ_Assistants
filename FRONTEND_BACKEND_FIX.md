# Frontend-Backend Connection Fix

## Issues Identified & Resolved

### Problem 1: Incorrect API Base URL
**Issue:** Frontend was calling `/auth/login` but API Gateway expected `/api/auth/login`

**Fix:** Updated [frontend/web/src/services/api.js](frontend/web/src/services/api.js)
- Changed `baseURL` from `"https://personal-financ-assistants-2.onrender.com"` to `"https://personal-financ-assistants-2.onrender.com/api"`
- Now all API calls automatically include `/api` prefix

**Result:**
- `/auth/login` → `https://personal-financ-assistants-2.onrender.com/api/auth/login` ✅
- `/auth/register` → `https://personal-financ-assistants-2.onrender.com/api/auth/register` ✅
- `/auth/me` → `https://personal-financ-assistants-2.onrender.com/api/auth/me` ✅

---

### Problem 2: Non-existent `/v1/retrieve` Endpoint
**Issue:** Frontend was calling `/v1/retrieve` which doesn't exist in the API Gateway

**Fix:** 
1. Added new `/retrieve` endpoint to [services/llm-service/src/routes/chatRoutes.js](services/llm-service/src/routes/chatRoutes.js)
   - This endpoint directly queries the Pathway RAG system
   - Returns array of relevant documents

2. Added proxy routing in [services/api-gateway/src/app.js](services/api-gateway/src/app.js)
   - `/api/retrieve` now proxies to LLM service's `/api/chat/retrieve`

3. Updated [frontend/web/src/pages/ChatPage.jsx](frontend/web/src/pages/ChatPage.jsx)
   - Changed from `/v1/retrieve` to `/retrieve` (baseURL handles the `/api` prefix)
   - Now calls: `https://personal-financ-assistants-2.onrender.com/api/retrieve` ✅

---

### Problem 3: CORS Configuration
**Issue:** API Gateway might reject requests from frontend deployed on different origin

**Fix:** Enhanced CORS in [services/api-gateway/src/app.js](services/api-gateway/src/app.js)
- Added comprehensive CORS options:
  - `origin: '*'` - Accept requests from any origin
  - Support for `Authorization` header (for JWT tokens)
  - Support for `Content-Type` and `X-Requested-With` headers
  - Methods: GET, POST, PUT, DELETE, OPTIONS

---

### Problem 4: Auth Service Error Handling
**Issue:** Login errors not being properly forwarded

**Fix:** Enhanced error handling in [frontend/web/src/services/auth.service.js](frontend/web/src/services/auth.service.js)
- Added try-catch with detailed error logging
- Better error propagation to UI

---

## API Endpoints Summary

### Authentication Routes
| Endpoint | Method | Path |
|----------|--------|------|
| Register | POST | `/api/auth/register` |
| Login | POST | `/api/auth/login` |
| Get User | GET | `/api/auth/me` |

### Chat/RAG Routes
| Endpoint | Method | Path |
|----------|--------|------|
| RAG Retrieve | POST | `/api/retrieve` |
| Chat Message | POST | `/api/chat/message` |
| Dashboard Data | POST | `/api/chat/dashboard-data` |

### User Data Routes
| Endpoint | Method | Path |
|----------|--------|------|
| Upload Document | POST | `/api/user-data/upload` |
| Get Documents | GET | `/api/user-data/documents` |
| Delete Document | DELETE | `/api/user-data/documents/:id` |
| Personalize | POST | `/api/user-data/personalize` |

---

## Testing the Connection

### 1. Test Frontend to Backend Connection
```bash
# From browser console or Postman
GET https://personal-financ-assistants-2.onrender.com/api/health

# Should return: { status: 'UP', service: 'API Gateway' }
```

### 2. Test Authentication
```bash
# Register new user
POST https://personal-financ-assistants-2.onrender.com/api/auth/register
Body: { username: "testuser", email: "test@example.com", password: "password123" }

# Login
POST https://personal-financ-assistants-2.onrender.com/api/auth/login
Body: { email: "test@example.com", password: "password123" }
```

### 3. Test RAG Retrieval
```bash
# Retrieve documents
POST https://personal-financ-assistants-2.onrender.com/api/retrieve
Headers: { Authorization: "Bearer <token_from_login>" }
Body: { query: "my transactions", userId: "testuser", k: 3 }
```

### 4. Test Dashboard
```bash
# Get dashboard data
POST https://personal-financ-assistants-2.onrender.com/api/chat/dashboard-data
Headers: { Authorization: "Bearer <token_from_login>" }
Body: { userId: "testuser", forceRefresh: false }
```

---

## Files Modified

1. **Frontend:**
   - [frontend/web/src/services/api.js](frontend/web/src/services/api.js) - Fixed baseURL
   - [frontend/web/src/services/auth.service.js](frontend/web/src/services/auth.service.js) - Enhanced error handling
   - [frontend/web/src/pages/ChatPage.jsx](frontend/web/src/pages/ChatPage.jsx) - Updated endpoint from `/v1/retrieve` to `/retrieve`

2. **Backend Services:**
   - [services/api-gateway/src/app.js](services/api-gateway/src/app.js) - Enhanced CORS, Added `/api/retrieve` proxy
   - [services/llm-service/src/routes/chatRoutes.js](services/llm-service/src/routes/chatRoutes.js) - Added `/retrieve` endpoint

---

## Environment Variables Needed

The backend needs these `.env` variables set on Render:

```env
# Auth
JWT_SECRET=finance_assistant_jwt_secret_2024

# MongoDB
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/auth_db

# APIs
GEMINI_API_KEY=your_gemini_api_key

# Service URLs (for docker-compose, Render auto-handles these)
AUTH_SERVICE_URL=http://auth-service:3001
LLM_SERVICE_URL=http://llm-service:5000
USER_DATA_SERVICE_URL=http://user-data-service:3003
TRANSACTION_SERVICE_URL=http://transaction-service:3004
COMPLIANCE_SERVICE_URL=http://compliance-service:3005
NOTIFICATION_SERVICE_URL=http://notification-service:3006

# Pathway
PATHWAY_URL=http://pathway-processor:8081
```

---

## Next Steps

1. **Deploy Updated Frontend**
   - Push changes to your frontend repository
   - Rebuild and deploy to your frontend hosting (Vercel, Netlify, etc.)

2. **Deploy Updated Backend**
   - Push changes to your backend repository  
   - The Render deployment should auto-rebuild

3. **Test End-to-End**
   - Register a new account
   - Upload financial documents
   - Try RAG queries
   - Check dashboard data loads correctly

4. **Monitor Logs**
   - Check frontend browser console (DevTools) for errors
   - Check backend logs on Render for API issues
   - Look for CORS errors or missing endpoints

---

## Troubleshooting

### Error: "POST /api/auth/login 404"
- Ensure auth-service is running
- Check AUTH_SERVICE_URL in API Gateway environment

### Error: "CORS error" or "Access blocked"
- Verify CORS is enabled in API Gateway
- Check frontend is sending correct headers
- Test with `curl` to bypass browser CORS restrictions

### Error: "Cannot POST /api/retrieve"
- Ensure LLM service is running
- Check that chatRoutes has the new `/retrieve` endpoint
- Verify LLM_SERVICE_URL is correct

### Error: "connect ECONNREFUSED"
- Backend services might be down
- Check Render deployment status
- Verify all microservices are started
