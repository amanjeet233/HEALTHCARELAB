# Redis Caching - Quick Integration Guide

## Quick Start: Adding Cache to Services

### Step 1: Inject CacheEvictionService
```java
@Service
@RequiredArgsConstructor
public class YourService {
    
    private final CacheEvictionService cacheEvictionService;
    private final YourRepository repository;
    
    // ... rest of code
}
```

### Step 2: Call Eviction Methods on Data Changes

#### For Test/Package Creation
```java
@Transactional
public TestDTO createTest(TestRequest request) {
    Test test = new Test();
    // ... set properties
    Test saved = repository.save(test);
    
    cacheEvictionService.evictAllTestCaches();
    
    return new TestDTO(saved);
}
```

#### For Test/Package Updates
```java
@Transactional
public TestDTO updateTest(Long id, TestRequest request) {
    Test test = repository.findById(id).orElseThrow();
    // ... update properties
    repository.save(test);
    
    cacheEvictionService.evictTestCache(id);
    cacheEvictionService.evictSearchAndListCaches();
    
    return new TestDTO(test);
}
```

#### For Test/Package Deletion
```java
@Transactional
public void deleteTest(Long id) {
    repository.deleteById(id);
    
    cacheEvictionService.evictTestCache(id);
    cacheEvictionService.evictAllTestCaches();
}
```

---

## Cache Hit/Miss Indicators

### In Logs
```
# Cache Hit
[DEBUG] Cache key 'testById::5' found in cache

# Cache Miss
[DEBUG] Cache miss for 'allTests' - executing method
```

### Response Time
- **Cache Hit:** 5-20ms
- **Cache Miss:** 50-200ms (database + cache store)

---

## Common Eviction Scenarios

### Scenario 1: Update Test Details
```java
// Affects: testById, searchResults, testsByCategory, testsByType
cacheEvictionService.evictTestCache(testId);
cacheEvictionService.evictSearchAndListCaches();
```

### Scenario 2: Update Test Status (Active/Inactive)
```java
// Affects: allTests, testsByCategory, testsByType, searchResults
cacheEvictionService.evictAllTestCaches();
```

### Scenario 3: Update Package Details
```java
// Affects: packageById, packages, bestDeals
cacheEvictionService.evictPackageCache(packageId);
```

### Scenario 4: Re-arrange Best Deals
```java
// Affects: bestDeals and packages list
cacheEvictionService.evictAllPackageCaches();
```

---

## Redis CLI Commands

```bash
# Check if Redis is running
redis-cli ping
# Output: PONG

# View all cache keys
redis-cli KEYS allTests*
redis-cli KEYS testById*
redis-cli KEYS packages*

# Check remaining TTL (in seconds)
redis-cli TTL "testById::5"

# View cache value (if not large)
redis-cli GET "allTests"

# Delete specific cache
redis-cli DEL "allTests"

# Clear all caches
redis-cli FLUSHALL

# View memory usage
redis-cli INFO memory

# View connected clients
redis-cli INFO stats
```

---

## Configuration Checklist

- [ ] `spring-boot-starter-cache` dependency added to pom.xml
- [ ] `spring-boot-starter-data-redis` dependency present in pom.xml
- [ ] `CacheConfig.java` created with @EnableCaching
- [ ] `application.properties` has Redis configuration
- [ ] Redis server running on localhost:6379
- [ ] `@Cacheable` annotations added to GET endpoints
- [ ] `CacheEvictionService` injected in services
- [ ] Cache eviction calls added to POST/PUT/DELETE operations
- [ ] Debug logging enabled for troubleshooting
- [ ] Tested cache hits and misses locally

---

## Performance Tuning

### If Cache Hit Rate is Low
1. **Increase TTL** - Users may not repeat queries within short window
2. **Check Eviction Logic** - May be evicting too aggressively
3. **Monitor Key Design** - Ensure consistent key generation

### If Redis Memory is High
1. **Reduce TTL** - Shorter expiration for less frequently accessed data
2. **Limit Pool Size** - Reduce `max-active` connections
3. **Enable LRU Policy** - Configure Redis: `maxmemory-policy allkeys-lru`

### If Response Time Still Slow
1. **Profile Database Queries** - Cache may not be the bottleneck
2. **Check Network Latency** - Redis server location
3. **Scale horizontally** - Use Redis Cluster if needed

---

## Testing Cache Behavior

### Test 1: Verify Cache Hit
```bash
# First request (cache miss)
time curl http://localhost:8080/api/lab-tests
# Response time: ~100-150ms

# Second request (cache hit)
time curl http://localhost:8080/api/lab-tests
# Response time: ~10-20ms
```

### Test 2: Verify Cache Eviction
```bash
# Create/Update test (should trigger cache eviction)
curl -X POST http://localhost:8080/api/admin/tests \
  -H "Content-Type: application/json" \
  -d '{"name":"COVID Test","code":"COVID19","price":500}'

# Next GET should repopulate cache (cache miss)
time curl http://localhost:8080/api/lab-tests
# Response time: ~100-150ms (cache was cleared)
```

### Test 3: Check Redis Directly
```bash
# Connect to Redis
redis-cli

# Check keys
127.0.0.1:6379> KEYS *
1) "allTests"
2) "testById::5"
3) "searchResults::aspirin"

# Check TTL
127.0.0.1:6379> TTL "allTests"
(integer) 3450  # 57.5 minutes remaining (out of 60)
```

---

## Sample Application Flow

```
User Request Flow with Caching:

1. First Request: GET /api/lab-tests
   ├─ Check Cache ──[Cache Miss]──> Query Database (100ms)
   ├─ Store in Redis (10ms)
   └─ Return Response (110ms total)

2. Second Request: GET /api/lab-tests (within 1 hour)
   ├─ Check Cache ──[Cache Hit]──> Return Cached Data (10ms)
   └─ Return Response (10ms total)

3. Admin Update Test
   ├─ Update Database
   ├─ Call cacheEvictionService.evictTestCache(id)
   ├─ Clear Related Caches
   └─ Confirm Update

4. Next Request: GET /api/lab-tests
   ├─ Check Cache ──[Cache Miss]──> Query Database (100ms)
   ├─ Store in Redis (10ms)
   └─ Return Response (110ms total)

Benefits: User sees 10x faster responses on subsequent requests
          until cache expires or is invalidated
```

---

## Logging Examples

### Expected Log Output
```
[INFO] ▶️  INCOMING REQUEST
[INFO] Method: GET | URL: /api/lab-tests
[DEBUG] Checking cache 'allTests'...
[DEBUG] Cache key 'allTests' found and valid
[DEBUG] Returning cached response (3450s TTL remaining)
[INFO] ⬅️  OUTGOING RESPONSE
[INFO] Response Time: 12ms
[INFO] Status Code: ✅ 200

---

[INFO] ▶️  INCOMING REQUEST
[INFO] Method: POST | URL: /api/admin/tests
[DEBUG] Executing method: createTest
[DEBUG] Saving to database...
[DEBUG] Evicting cache: 'allTests' (1/7 caches)
[DEBUG] Evicting cache: 'testById' (2/7 caches)
[DEBUG] Evicting cache: 'searchResults' (3/7 caches)
[DEBUG] Evicting cache: 'filterResults' (4/7 caches)
[DEBUG] Evicting cache: 'testsByCategory' (5/7 caches)
[DEBUG] Evicting cache: 'testsByType' (6/7 caches)
[DEBUG] Evicting cache: 'typesList' (7/7 caches)
[INFO] 🗑️  Evicted all test-related caches
[INFO] ⬅️  OUTGOING RESPONSE
[INFO] Response Time: 85ms
[INFO] Status Code: ✅ 201
```

---

## Summary of Files

| File | Purpose |
|------|---------|
| `CacheConfig.java` | Cache manager configuration |
| `CacheEvictionService.java` | Cache invalidation methods |
| `LabTestController.java` | @Cacheable annotations on endpoints |
| `application.properties` | Redis connection settings |
| `pom.xml` | Spring Cache dependency |
| `CACHING_GUIDE.md` | Full documentation (this file) |

---

## Next Steps

1. Start Redis server: `redis-server`
2. Run application: `mvn spring-boot:run`
3. Make API requests and observe cache behavior
4. Check `application.log` for cache hit/miss messages
5. Use `redis-cli` to inspect cached data
6. Integrate cache eviction into service methods

For detailed information, see `CACHING_GUIDE.md`
