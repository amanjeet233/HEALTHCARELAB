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
    <div className='individual-tests-page bg-[#F8FAFC]'>
      {/* Header */}
      <section className='page-header-individual bg-white border-b border-slate-100 py-10 px-4 text-center'>
        <div className='header-content-individual max-w-4xl mx-auto'>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">🧪 Browse Lab Tests</h1>
          <p className="text-slate-500 font-bold uppercase text-[11px] tracking-widest mt-2 opacity-70">Premium Diagnostic Catalog</p>
        </div>
      </section>

      <div className='tests-container-individual max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8'>
        {/* Sidebar Filters - Desktop */}
        <aside className='filters-sidebar-individual w-full md:w-64 shrink-0'>
          <div className='bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-6'>
            <div className='filters-header flex items-center justify-between'>
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Filters</h3>
              {hasActiveFilters && (
                <button className='text-[10px] font-black text-red-500 uppercase tracking-tighter' onClick={handleResetFilters}>
                  Clear All
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className='space-y-3'>
              <h4 className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>Category</h4>
              <div className='flex flex-wrap gap-2'>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${category === cat ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                    onClick={() => setCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className='space-y-3'>
              <h4 className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>Price Range</h4>
              <div className='grid grid-cols-2 gap-2'>
                <input
                  type='number'
                  placeholder='Min'
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className='w-full bg-slate-50 border-none rounded-xl px-3 py-2 text-xs font-bold'
                />
                <input
                  type='number'
                  placeholder='Max'
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className='w-full bg-slate-50 border-none rounded-xl px-3 py-2 text-xs font-bold'
                />
              </div>
            </div>

            {/* Fasting Filter */}
            <div className='pt-2'>
              <label className='flex items-center gap-3 cursor-pointer group'>
                <input
                  type='checkbox'
                  checked={fastingOnly}
                  onChange={(e) => setFastingOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-200"
                />
                <span className="text-[11px] font-black text-slate-600 uppercase tracking-tight group-hover:text-slate-900 transition-colors">Fasting Required</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className='tests-main-individual flex-1'>
          {/* Search Bar */}
          <div className='relative mb-6'>
            <FaSearch className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm' />
            <input
              type='text'
              placeholder='Search tests by name, code, or symptoms...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full bg-white border border-slate-100 rounded-2xl pl-11 pr-4 py-3 text-sm font-bold shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all'
            />
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-20"><LoadingSpinner /></div>
          )}

          {/* Tests Grid */}
          {!loading && tests.length > 0 ? (
            <div className="space-y-8">
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4'>
                {tests.map((test) => (
                  <TestCard
                    key={test.id}
                    test={{
                      id: test.id,
                      name: test.testName,
                      slug: test.testCode,
                      category: test.categoryName,
                      price: test.price,
                      originalPrice: test.originalPrice || Math.round(test.price * 1.3),
                      shortDesc: test.shortDescription || test.description,
                      sampleType: test.sampleType,
                      fastingRequired: test.fastingRequired,
                      turnaroundTime: test.turnaroundTime,
                      rating: 4.8,
                      parametersCount: test.parametersCount || (test.subTests?.length || 0),
                      isTopBooked: test.isTopBooked,
                      isTopDeal: test.isTopDeal,
                      isPackage: test.isPackage || test.categoryName === 'PACKAGE'
                    }}
                    onViewDetails={(slug) => navigate(`/test/${slug}`)}
                    onBook={() => navigate(`/checkout?testId=${test.id}`)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className='pagination-individual flex items-center justify-center gap-4 mt-8'>
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
