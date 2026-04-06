import React, { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FaFilter, FaSearch, FaTimes } from 'react-icons/fa'
import { IndividualTestCard } from '@/components/IndividualTestCard'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import './IndividualTestsPage.css'

interface Test {
  id: number
  testCode: string
  testName: string
  categoryName: string
  price: number
  originalPrice?: number
  description: string
  shortDescription?: string
  turnaroundTime: string
  fastingRequired: boolean
  fastingHours?: number
  sampleType: string
  subTests?: string[]
  tags?: string[]
  isActive?: boolean
}

interface ApiResponse {
  success: boolean
  message: string
  data: {
    content: Test[]
    totalElements: number
    totalPages: number
    number: number
    size: number
  }
}

export default function IndividualTestsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  
  // State
  const [tests, setTests] = useState<Test[]>([])
  const [loading, setLoading] = useState(false)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalResults, setTotalResults] = useState(0)

  // Filters
  const [category, setCategory] = useState(searchParams.get('category') || 'ALL')
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')
  const [fastingOnly, setFastingOnly] = useState(searchParams.get('fasting') === 'true')
  const [showFilters, setShowFilters] = useState(false)
  const [categoryCounts, setCategoryCounts] = useState<{ [key: string]: number }>({})

  const CATEGORIES = ['ALL', 'BLOOD', 'URINE', 'IMAGING', 'PATHOLOGY']

  // ✅ Fetch Tests with Filters
  const fetchTests = useCallback(async (page = 0) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (category && category !== 'ALL') params.append('category', category)
      if (searchTerm) params.append('search', searchTerm)
      if (minPrice) params.append('minPrice', minPrice)
      if (maxPrice) params.append('maxPrice', maxPrice)
      if (fastingOnly) params.append('fasting', 'true')
      params.append('page', page.toString())
      params.append('size', '12')

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }

      // Add JWT token if available
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`/api/lab-tests/filter?${params.toString()}`, { headers })
      const result: ApiResponse = await response.json()

      console.log('API Response:', result)

      setTests(result.data.content || [])
      setTotalPages(result.data.totalPages || 0)
      setCurrentPage(result.data.number || 0)
      setTotalResults(result.data.totalElements || 0)

      // Update URL
      setSearchParams(params)
    } catch (error) {
      console.error('Error fetching tests:', error)
      setTests([])
    } finally {
      setLoading(false)
    }
  }, [category, searchTerm, minPrice, maxPrice, fastingOnly, setSearchParams])

  // ✅ Fetch Category Counts
  const fetchCategoryCounts = useCallback(async () => {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }

      // Add JWT token if available
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch('/api/lab-tests/category-counts', { headers })
      const result: any = await response.json()
      console.log('Category Counts:', result)
      setCategoryCounts(result.data || {})
    } catch (error) {
      console.error('Error fetching category counts:', error)
    }
  }, [])

  // ✅ Load on Mount and When Filters Change
  useEffect(() => {
    fetchTests(0)
    fetchCategoryCounts()
  }, [fetchTests, fetchCategoryCounts])

  // ✅ Handle Add to Cart
  const handleAddToCart = async (testId: number) => {
    // Implementation depends on your cart system
    console.log('Adding test to cart:', testId)
    // Call your cart service here
  }

  // ✅ Handle View Details
  const handleViewDetails = (testCode: string) => {
    // Navigation to test detail page
    console.log('Viewing test:', testCode)
    // window.location.href = `/tests/${testCode}`
  }

  // ✅ Reset Filters
  const handleResetFilters = () => {
    setCategory('ALL')
    setSearchTerm('')
    setMinPrice('')
    setMaxPrice('')
    setFastingOnly(false)
    setSearchParams({})
  }

  // ✅ Filter Active
  const hasActiveFilters = category !== 'ALL' || searchTerm || minPrice || maxPrice || fastingOnly

  return (
    <div className='individual-tests-page'>
      {/* Header */}
      <section className='page-header-individual'>
        <div className='header-content-individual'>
          <h1>Browse Lab Tests</h1>
          <p>Select individual tests for your health checkup</p>
        </div>
      </section>

      <div className='tests-container-individual'>
        {/* Sidebar Filters - Desktop */}
        <aside className='filters-sidebar-individual'>
          <div className='filters-header'>
            <h3>Filters</h3>
            {hasActiveFilters && (
              <button className='reset-filters' onClick={handleResetFilters}>
                <FaTimes /> Reset
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className='filter-group-individual'>
            <h4 className='filter-title'>Category</h4>
            <div className='category-list'>
              {CATEGORIES.map((cat) => (
                <label key={cat} className='category-option'>
                  <input
                    type='radio'
                    name='category'
                    value={cat}
                    checked={category === cat}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                  <span className='category-label'>
                    {cat}
                    {categoryCounts[cat] && (
                      <span className='count-badge'>{categoryCounts[cat]}</span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className='filter-group-individual'>
            <h4 className='filter-title'>Price Range</h4>
            <div className='price-inputs'>
              <input
                type='number'
                placeholder='Min (₹)'
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className='price-input'
                min='0'
              />
              <span className='dash'>-</span>
              <input
                type='number'
                placeholder='Max (₹)'
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className='price-input'
                min='0'
              />
            </div>
            <div className='quick-prices'>
              <button
                className={`quick-price ${minPrice === '' && maxPrice === '500' ? 'active' : ''}`}
                onClick={() => {
                  setMinPrice('')
                  setMaxPrice('500')
                }}
              >
                Under ₹500
              </button>
              <button
                className={`quick-price ${minPrice === '500' && maxPrice === '1000' ? 'active' : ''}`}
                onClick={() => {
                  setMinPrice('500')
                  setMaxPrice('1000')
                }}
              >
                ₹500-1000
              </button>
              <button
                className={`quick-price ${minPrice === '1000' && maxPrice === '' ? 'active' : ''}`}
                onClick={() => {
                  setMinPrice('1000')
                  setMaxPrice('')
                }}
              >
                Above ₹1000
              </button>
            </div>
          </div>

          {/* Fasting Filter */}
          <div className='filter-group-individual'>
            <h4 className='filter-title'>Fasting Required</h4>
            <label className='checkbox-option'>
              <input
                type='checkbox'
                checked={fastingOnly}
                onChange={(e) => setFastingOnly(e.target.checked)}
              />
              <span>Fasting required only</span>
            </label>
          </div>
        </aside>

        {/* Main Content */}
        <div className='tests-main-individual'>
          {/* Search Bar */}
          <div className='search-bar-individual'>
            <FaSearch className='search-icon' />
            <input
              type='text'
              placeholder='Search tests by name, code, or symptoms...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='search-input'
            />
            {searchTerm && (
              <button
                className='clear-search'
                onClick={() => setSearchTerm('')}
              >
                <FaTimes />
              </button>
            )}
          </div>

          {/* Mobile Filter Toggle */}
          <button className='mobile-filter-toggle' onClick={() => setShowFilters(!showFilters)}>
            <FaFilter /> Filters
          </button>

          {/* Results Info */}
          <div className='results-info-individual'>
            <p>
              Showing <strong>{tests.length}</strong> of <strong>{totalResults}</strong> tests
              {hasActiveFilters && <span className='filter-badge'>(Filtered)</span>}
            </p>
          </div>

          {/* Loading State */}
          {loading && <LoadingSpinner />}

          {/* Tests Grid */}
          {!loading && tests.length > 0 ? (
            <>
              <div className='tests-grid-individual'>
                {tests.map((test) => (
                  <IndividualTestCard
                    key={test.id}
                    test={test}
                    onViewDetails={handleViewDetails}
                    onAddToCart={handleAddToCart}
                    isLoading={loading}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className='pagination-individual'>
                  {currentPage > 0 && (
                    <button
                      className='pagination-btn'
                      onClick={() => fetchTests(currentPage - 1)}
                    >
                      ← Previous
                    </button>
                  )}

                  <div className='page-info'>
                    Page {currentPage + 1} / {totalPages}
                  </div>

                  {currentPage < totalPages - 1 && (
                    <button
                      className='pagination-btn'
                      onClick={() => fetchTests(currentPage + 1)}
                    >
                      Next →
                    </button>
                  )}
                </div>
              )}
            </>
          ) : !loading ? (
            <div className='no-results-individual'>
              <p>No tests found matching your filters.</p>
              <button className='reset-button' onClick={handleResetFilters}>
                Clear Filters and Try Again
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
