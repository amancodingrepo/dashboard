# Route Debug Test

## Issue Found and Fixed

The 404 error for `/api/chat-with-data` was caused by a **variable naming inconsistency** in the route file:

### Problem
- `chatWithData.ts` was using variable `r` instead of `router`
- Export statement was `export default r` instead of `export default router`
- This caused the route to not be properly exported and registered

### Fix Applied
✅ Changed `const r = Router()` to `const router = Router()`
✅ Changed `r.post("/", ...)` to `router.post("/", ...)`  
✅ Changed `export default r` to `export default router`
✅ Added debugging logs to track requests

## Testing Steps

### 1. Test API Base Functionality
```bash
curl https://your-app.vercel.app/api/test
```
Expected: `{"message": "API is working", "timestamp": "..."}`

### 2. Test Chat Endpoint
```bash
curl -X POST https://your-app.vercel.app/api/chat-with-data \
  -H "Content-Type: application/json" \
  -d '{"query": "Show top vendors"}'
```

### 3. Check Vercel Function Logs
- Go to Vercel Dashboard > Your Project > Functions tab
- Look for logs from the API function
- Should see: "Chat with data endpoint hit: {query: '...'}"

## Additional Debugging Added

1. **Request Logging**: Added middleware to log all `/api/*` requests
2. **Test Endpoint**: Added `/api/test` endpoint to verify API is working
3. **Route Debugging**: Added console.log in chatWithData route

## Next Steps After Deployment

1. ✅ Code fixes applied
2. 🔄 Deploy to Vercel (the route fix should resolve the 404)
3. 🔄 Test the endpoints above
4. 🔄 Check Vercel function logs for any remaining issues

The 404 error should be resolved after redeployment!
