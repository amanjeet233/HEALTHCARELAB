package com.healthcare.labtestbooking.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;

/**
 * Service for managing cache eviction on data modifications.
 * 
 * Evicts relevant caches when:
 * - Tests are created, updated, or deleted
 * - Packages are created, updated, or deleted
 * - Any data that affects search, filter, or list results
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CacheEvictionService {

    /**
     * Evict all test-related caches when a test is modified or created
     */
    @Caching(evict = {
            @CacheEvict(value = "allTests", allEntries = true),
            @CacheEvict(value = "testById", allEntries = true),
            @CacheEvict(value = "searchResults", allEntries = true),
            @CacheEvict(value = "filterResults", allEntries = true),
            @CacheEvict(value = "testsByCategory", allEntries = true),
            @CacheEvict(value = "testsByType", allEntries = true),
            @CacheEvict(value = "typesList", allEntries = true)
    })
    public void evictAllTestCaches() {
        log.info("🗑️  Evicted all test-related caches");
    }

    /**
     * Evict cache for a specific test by ID
     */
    @CacheEvict(value = "testById", key = "#testId")
    public void evictTestCache(Long testId) {
        log.info("🗑️  Evicted cache for test ID: {}", testId);
    }

    /**
     * Evict all test and search caches
     */
    @Caching(evict = {
            @CacheEvict(value = "allTests", allEntries = true),
            @CacheEvict(value = "searchResults", allEntries = true),
            @CacheEvict(value = "filterResults", allEntries = true)
    })
    public void evictSearchAndListCaches() {
        log.info("🗑️  Evicted all search and list caches");
    }

    /**
     * Evict all package-related caches when a package is modified or created
     */
    @Caching(evict = {
            @CacheEvict(value = "packages", allEntries = true),
            @CacheEvict(value = "packageById", allEntries = true),
            @CacheEvict(value = "bestDeals", allEntries = true)
    })
    public void evictAllPackageCaches() {
        log.info("🗑️  Evicted all package-related caches");
    }

    /**
     * Evict cache for a specific package by ID
     */
    @CacheEvict(value = "packageById", key = "#packageId")
    public void evictPackageCache(Long packageId) {
        log.info("🗑️  Evicted cache for package ID: {}", packageId);
    }

    /**
     * Evict categories filter cache
     */
    @CacheEvict(value = "testsByCategory", allEntries = true)
    public void evictCategoryFilterCache() {
        log.info("🗑️  Evicted category filter cache");
    }

    /**
     * Evict type filter cache
     */
    @CacheEvict(value = "testsByType", allEntries = true)
    public void evictTypeFilterCache() {
        log.info("🗑️  Evicted type filter cache");
    }
}
