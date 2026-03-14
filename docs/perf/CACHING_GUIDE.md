# Redis Caching Implementation Guide

## Overview
This document describes the Redis caching implementation for the Healthcare Lab Test Booking System. The caching layer stores frequently accessed data with configurable TTLs (Time-To-Live) to improve API response times and reduce database load.

---

## Cache Configuration

### File: `CacheConfig.java`
Location: `src/main/java/com/healthcare/labtestbooking/config/CacheConfig.java`

**Annotations:**
- `@Configuration` - Spring configuration class
- `@EnableCaching` - Enables Spring's caching support

**Bean:** `cacheManager(RedisConnectionFactory)`
- Configures Redis as the cache provider
- Defines TTL for each cache based on data freshness requirements

---

## Cache Definitions

| Cache Name | TTL | Use Case |
|-----------|-----|----------|
| `allTests` | 1 hour | All active lab tests list |
| `testById` | 24 hours | Individual test details by ID |
| `packages` | 1 hour | All active test packages list |
| `packageById` | 24 hours | Individual package details by ID |
| `searchResults` | 30 minutes | Search results by keyword |
| `filterResults` | 30 minutes | Filter results by price range |
| `testsByCategory` | 1 hour | Tests filtered by category |
| `testsByType` | 1 hour | Tests filtered by type |
| `typesList` | 24 hours | List of all test types (enum) |
| `bestDeals` | 1 hour | Best deal packages |

**TTL Rationale:**
- **24 hours:** Individual resource details (rarely change, high hit rate)
- **1 hour:** List and category data (moderate change frequency, high traffic)
- **30 minutes:** Search and dynamic filters (content-dependent caching)
- **Default:** 30 minutes (any unconfigured cache)

---

## Cached Endpoints

### Lab Test Endpoints

#### `GET /api/lab-tests`
```java
@GetMapping
@Cacheable("allTests")
public ResponseEntity<ApiResponse<List<LabTestDTO>>> getAllTests()
```
- **Cache:** allTests (1 hour)
- **Returns:** All active tests
- **Key:** Fixed (no parameters)

#### `GET /api/lab-tests/{id}`
```java
@GetMapping("/{id}")
@Cacheable(value = "testById", key = "#id")
public ResponseEntity<ApiResponse<LabTestDTO>> getTestById(@PathVariable Long id)
```
- **Cache:** testById (24 hours)
- **Returns:** Single test details
- **Key:** Test ID

#### `GET /api/lab-tests/search`
```java
@GetMapping("/search")
@Cacheable(value = "searchResults", key = "#keyword")
public ResponseEntity<ApiResponse<List<LabTestDTO>>> searchTests(@RequestParam String keyword)
```
- **Cache:** searchResults (30 minutes)
- **Returns:** Search results
- **Key:** Keyword parameter

#### `GET /api/lab-tests/price-range`
```java
@GetMapping("/price-range")
@Cacheable(value = "filterResults", key = "T(java.lang.String).format('%s_%s', #min, #max)")
public ResponseEntity<ApiResponse<List<LabTestDTO>>> getTestsByPriceRange(
    @RequestParam BigDecimal min,
    @RequestParam BigDecimal max)
```
- **Cache:** filterResults (30 minutes)
- **Returns:** Tests within price range
- **Key:** min_max (combined)

#### `GET /api/lab-tests/category/{categoryId}`
```java
@GetMapping("/category/{categoryId}")
@Cacheable(value = "testsByCategory", key = "#categoryId")
public ResponseEntity<ApiResponse<List<LabTestDTO>>> getTestsByCategory(@PathVariable Long categoryId)
```
- **Cache:** testsByCategory (1 hour)
- **Returns:** Tests in specific category
- **Key:** Category ID

#### `GET /api/lab-tests/type/{testType}`
```java
@GetMapping("/type/{testType}")
@Cacheable(value = "testsByType", key = "#testType")
public ResponseEntity<ApiResponse<List<LabTestDTO>>> getTestsByType(@PathVariable TestType testType)
```
- **Cache:** testsByType (1 hour)
- **Returns:** Tests of specific type
- **Key:** Test type enum

#### `GET /api/lab-tests/types`
```java
@GetMapping("/types")
@Cacheable("typesList")
public ResponseEntity<ApiResponse<List<TestType>>> getAllTestTypes()
```
- **Cache:** typesList (24 hours)
- **Returns:** All test type enums
- **Key:** Fixed (no parameters)

### Package Endpoints

#### `GET /api/lab-tests/packages`
```java
@GetMapping("/packages")
@Cacheable("packages")
public ResponseEntity<ApiResponse<List<TestPackageDTO>>> getAllPackages()
```
- **Cache:** packages (1 hour)

#### `GET /api/lab-tests/packages/{id}`
```java
@GetMapping("/packages/{id}")
@Cacheable(value = "packageById", key = "#id")
public ResponseEntity<ApiResponse<TestPackageDTO>> getPackageById(@PathVariable Long id)
```
- **Cache:** packageById (24 hours)

#### `GET /api/lab-tests/packages/best-deals`
```java
@GetMapping("/packages/best-deals")
@Cacheable("bestDeals")
public ResponseEntity<ApiResponse<List<TestPackageDTO>>> getBestDeals()
```
- **Cache:** bestDeals (1 hour)

---

## Cache Eviction

### Service: `CacheEvictionService`
Location: `src/main/java/com/healthcare/labtestbooking/service/CacheEvictionService.java`

Provides methods to invalidate caches when data changes:

```java
// Evict all test-related caches
cacheEvictionService.evictAllTestCaches();

// Evict specific test cache
cacheEvictionService.evictTestCache(testId);

// Evict search and list caches
cacheEvictionService.evictSearchAndListCaches();

// Evict all package caches
cacheEvictionService.evictAllPackageCaches();

// Evict specific package cache
cacheEvictionService.evictPackageCache(packageId);

// Evict category filter
cacheEvictionService.evictCategoryFilterCache();

// Evict type filter
cacheEvictionService.evictTypeFilterCache();
```

### Integration with Services

When implementing POST/PUT/DELETE endpoints that modify tests or packages, inject `CacheEvictionService` and call appropriate eviction methods:

```java
@Service
@RequiredArgsConstructor
public class LabTestService {
    
    private final CacheEvictionService cacheEvictionService;
    private final LabTestRepository labTestRepository;
    
    @Transactional
    public LabTestDTO createTest(LabTestRequest request) {
        LabTest test = requestToEntity(request);
        LabTest saved = labTestRepository.save(test);
        
        // Invalidate affected caches
        cacheEvictionService.evictAllTestCaches();
        
        return entityToDTO(saved);
    }
    
    @Transactional
    public LabTestDTO updateTest(Long id, LabTestRequest request) {
        LabTest test = labTestRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Test not found"));
        // Update logic
        labTestRepository.save(test);
        
        // Invalidate affected caches
        cacheEvictionService.evictTestCache(id);
        cacheEvictionService.evictSearchAndListCaches();
        
        return entityToDTO(test);
    }
    
    @Transactional
    public void deleteTest(Long id) {
        labTestRepository.deleteById(id);
        
        // Invalidate affected caches
        cacheEvictionService.evictTestCache(id);
        cacheEvictionService.evictAllTestCaches();
    }
}
```

---

## Redis Configuration

### File: `application.properties`

```properties
# Redis Cache Configuration
spring.cache.type=redis
spring.redis.host=localhost
spring.redis.port=6379
spring.redis.timeout=2000
spring.redis.jedis.pool.max-active=20
spring.redis.jedis.pool.max-idle=10
spring.redis.jedis.pool.min-idle=5
spring.redis.jedis.pool.max-wait=-1ms

# Cache logging
logging.level.org.springframework.cache=DEBUG
logging.level.org.springframework.data.redis=DEBUG
```

### Configuration Details

| Property | Value | Purpose |
|----------|-------|---------|
| `spring.cache.type` | `redis` | Use Redis as cache provider |
| `spring.redis.host` | `localhost` | Redis server host |
| `spring.redis.port` | `6379` | Redis server port |
| `spring.redis.timeout` | `2000ms` | Connection timeout |
| `spring.redis.jedis.pool.max-active` | `20` | Max active connections |
| `spring.redis.jedis.pool.max-idle` | `10` | Max idle connections |
| `spring.redis.jedis.pool.min-idle` | `5` | Min idle connections |

---

## Cache Keys Explained

### Simple Keys
For single-parameter caches:
```java
@Cacheable(value = "testById", key = "#id")
// Cache key: "testById::12345"
```

### Complex Keys
For multi-parameter caches (using SpEL):
```java
@Cacheable(value = "filterResults", key = "T(java.lang.String).format('%s_%s', #min, #max)")
// Cache key: "filterResults::100.00_500.00"
```

### Fixed Keys
For parameter-less caches:
```java
@Cacheable("allTests")
// Cache key: "allTests"
```

---

## Performance Metrics

### Cache Hierarchy
1. **First Hit:** Database + Redis store (~50-200ms)
2. **Subsequent Hits:** Redis lookup (~5-20ms)
3. **Cache Miss After TTL:** Database + Redis store (~50-200ms)

### Expected Improvements
- **API Response Time:** 80-90% reduction on cache hits
- **Database Load:** 40-60% reduction for read-heavy workloads
- **Network Traffic:** 30-40% reduction in database queries

### Example
```
Without Cache:
┌─────────────┐
│  Client     │  ─────> GET /api/lab-tests ──────> DB (100ms)
│             │  <───── Response (150ms total)
└─────────────┘

With Cache (1st request):
┌─────────────┐
│  Client     │  ─────> GET /api/lab-tests ──────> DB (100ms) → Redis
│             │  <───── Response (150ms total)
└─────────────┘

With Cache (2nd+ request):
┌─────────────┐
│  Client     │  ─────> GET /api/lab-tests ──────> Redis (10ms)
│             │  <───── Response (15ms total)
└─────────────┘
```

---

## Monitoring Cache Usage

### View Cache Statistics
Enable cache logging to monitor hits and misses:

```properties
logging.level.org.springframework.cache=DEBUG
```

### Sample Log Output
```
[DEBUG] Cache key 'testById::5' found in cache
[DEBUG] Cache.EVICTED event for cache 'allTests' with key 'allTests'
[DEBUG] Cache miss for 'searchResults' with key 'aspirin'
```

### Manual Inspection
If using Redis CLI:
```bash
# Connect to Redis
redis-cli

# View all cache keys
KEYS allTests*
KEYS testById*
KEYS searchResults*

# Check TTL of a key
TTL "testById::123"

# View cache value
GET "testById::123"

# Clear specific cache
DEL "allTests"
FLUSHALL  # Clear all caches
```

---

## Best Practices

### 1. **Cache Key Design**
- Use clear, hierarchical naming: `cacheName::keyValue`
- Avoid spaces and special characters in keys
- Keep keys reasonably short for efficiency

### 2. **TTL Selection**
- Reference data (types, categories): 24 hours
- Frequently accessed data (lists): 1 hour
- Dynamic data (search, filters): 30 minutes
- Adjust based on business requirements

### 3. **Cache Invalidation**
- Always evict related caches when data changes
- Consider cascade invalidation (e.g., evict all tests when category changes)
- Log cache evictions for debugging

### 4. **Memory Management**
- Monitor Redis memory usage
- Set Redis maxmemory policy to `allkeys-lru` (least recently used)
- Use `spring.redis.jedis.pool.max-active` to limit connections

### 5. **Null Value Handling**
- Configuration disables caching of null values: `disableCachingNullValues()`
- This prevents caching of 404 errors or empty results
- Adjust if needed based on use case

---

## Troubleshooting

### Issue: Cache not working
**Solution:**
1. Verify Redis is running: `redis-cli ping` (should return PONG)
2. Check `spring.redis.host` and `spring.redis.port` in `application.properties`
3. Enable cache debug logging to see hits/misses

### Issue: Cache returning stale data
**Solution:**
1. Verify cache eviction is being called on data changes
2. Check TTL configurations match business requirements
3. Manually clear cache: `redis-cli FLUSHALL`

### Issue: Redis connection pool exhausted
**Solution:**
1. Increase `spring.redis.jedis.pool.max-active`
2. Reduce the number of concurrent requests
3. Monitor Redis connections: `redis-cli info stats`

---

## Dependencies

Added to `pom.xml`:
```xml
<!-- Spring Cache (for cache abstraction) -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-cache</artifactId>
</dependency>

<!-- Redis (already present) -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

---

## Summary

| Feature | Details |
|---------|---------|
| **Provider** | Redis |
| **Caches** | 10+ configurable caches |
| **TTL Range** | 30 minutes to 24 hours |
| **Cached Endpoints** | 12+ GET endpoints |
| **Eviction Service** | CacheEvictionService |
| **Configuration** | CacheConfig.java |
| **Monitoring** | SLF4J logging enabled |
| **Memory Efficient** | Null values not cached |

This caching layer significantly improves application performance while maintaining data consistency through strategic cache invalidation.
