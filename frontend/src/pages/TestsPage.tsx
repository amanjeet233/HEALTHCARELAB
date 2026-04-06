import { useEffect, useState, useRef } from 'react';
import { useTests } from '@/hooks/useTests';
import { useCart } from '@/hooks/useCart';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import './TestsPage.css';

export default function TestsPage() {
  const {
    tests,
    loading,
    error: testError,
    totalPages,
    currentPage,
    fetchTests,
    searchTests,
    resetError: resetTestError
  } = useTests();

  const {
    addTest,
    error: cartError
  } = useCart();

  const [category, setCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [fastingRequired, setFastingRequired] = useState(false);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const [cartSuccess, setCartSuccess] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // ✅ LOAD TESTS ON MOUNT
  useEffect(() => {
    loadTests();
  }, []);

  // ✅ LOAD TESTS FUNCTION
  const loadTests = async () => {
    resetTestError();
    await fetchTests(0, 20, category !== 'ALL' ? category : undefined);
  };

  // ✅ HANDLE CATEGORY CHANGE
  const handleCategoryChange = async (newCategory: string) => {
    setCategory(newCategory);
    setSearchTerm('');
    setMinPrice('');
    setMaxPrice('');
    setFastingRequired(false);
    resetTestError();
    await fetchTests(0, 20, newCategory !== 'ALL' ? newCategory : undefined);
  };

  // ✅ DEBOUNCED SEARCH (300ms)
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchTerm(query);
    resetTestError();
    setIsSearching(true);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(async () => {
      if (query.length > 2) {
        await searchTests(query);
      } else if (query.length === 0) {
        await fetchTests(0, 20, category !== 'ALL' ? category : undefined);
      }
      setIsSearching(false);
    }, 300);
  };

  // ✅ HANDLE PRICE FILTER CHANGE
  const handlePriceChange = async (newMinPrice: string, newMaxPrice: string) => {
    setMinPrice(newMinPrice);
    setMaxPrice(newMaxPrice);
    resetTestError();
    
    // Apply filter if valid
    if (newMinPrice || newMaxPrice) {
      await applyFilters(category, searchTerm, newMinPrice, newMaxPrice, fastingRequired);
    } else if (searchTerm.length === 0) {
      await fetchTests(0, 20, category !== 'ALL' ? category : undefined);
    }
  };

  // ✅ HANDLE FASTING FILTER
  const handleFastingFilter = async (checked: boolean) => {
    setFastingRequired(checked);
    resetTestError();
    
    if (checked) {
      await applyFilters(category, searchTerm, minPrice, maxPrice, checked);
    } else if (searchTerm.length === 0 && !minPrice && !maxPrice) {
      await fetchTests(0, 20, category !== 'ALL' ? category : undefined);
    }
  };

  // ✅ APPLY FILTERS (client-side filtering for now)
  const applyFilters = async (cat: string, search: string, min: string, max: string, fasting: boolean) => {
    // Load all tests first if needed
    if (search.length > 2) {
      await searchTests(search);
    } else {
      await fetchTests(0, 100, cat !== 'ALL' ? cat : undefined);
    }
  };

  // ✅ CLEAR ALL FILTERS
  const handleClearFilters = async () => {
    setCategory('ALL');
    setSearchTerm('');
    setMinPrice('');
    setMaxPrice('');
    setFastingRequired(false);
    resetTestError();
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    await fetchTests(0, 20);
  };

  // ✅ HANDLE PAGE CHANGE
  const handlePageChange = async (page: number) => {
    resetTestError();
    await fetchTests(page, 20, category !== 'ALL' ? category : undefined);
  };

  // ✅ HANDLE ADD TO CART
  const handleAddToCart = async (testId: number) => {
    setAddingToCart(testId);
    setCartSuccess(null);

    try {
      await addTest(testId, 1);
      setCartSuccess('✅ Added to cart!');
      setTimeout(() => setCartSuccess(null), 2000);
    } catch (err) {
      // Error handled by useCart
    }

    setAddingToCart(null);
  };

  // ✅ RESET CART ERROR
  const resetCartError = () => {
    // Cart error is managed by useCart hook
  };

  return (
    <div className="tests-page">
      {/* ✅ PAGE HEADER */}
      <div className="page-header">
        <h1 className="page-title">🧪 Explore Lab Tests</h1>
        <p className="page-subtitle">Find and book your health tests</p>
      </div>

      {/* ✅ ERROR ALERTS */}
      {(testError || cartError) && (
        <div className="error-alert">
          ❌ {testError || cartError}
          <button
            className="close-btn"
            onClick={() => {
              resetTestError();
              resetCartError();
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* ✅ SUCCESS MESSAGE */}
      {cartSuccess && (
        <div className="success-alert">
          {cartSuccess}
        </div>
      )}

      {/* ✅ FILTERS SIDEBAR */}
      <div className="filters-wrapper">
        <aside className="filters-sidebar">
          <div className="filters-header">
            <h2>Filters</h2>
            {(searchTerm || category !== 'ALL' || minPrice || maxPrice || fastingRequired) && (
              <button className="clear-filters-btn" onClick={handleClearFilters} title="Clear all filters">
                ✕ Clear All
              </button>
            )}
          </div>

          {/* ✅ SEARCH FILTER */}
          <div className="filter-group">
            <h3 className="filter-group-title">Refine Search</h3>
            <div className="search-container">
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input
                type="text"
                placeholder="Filter results..."
                value={searchTerm}
                onChange={handleSearch}
                className="filter-search-input"
              />
              {isSearching && <span className="search-loading">⏳</span>}
            </div>
          </div>

          {/* ✅ CATEGORY FILTER */}
          <div className="filter-group">
            <h3 className="filter-group-title">Category</h3>
            <div className="filter-options">
              {['ALL', 'BLOOD', 'URINE', 'IMAGING', 'PATHOLOGY', 'GENERAL'].map(cat => (
                <button
                  key={cat}
                  className={`filter-option ${category === cat ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* ✅ PRICE RANGE FILTER */}
          <div className="filter-group">
            <h3 className="filter-group-title">Price Range ($)</h3>
            <div className="price-inputs">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => handlePriceChange(e.target.value, maxPrice)}
                className="price-input"
                min="0"
              />
              <span className="price-divider">/</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => handlePriceChange(minPrice, e.target.value)}
                className="price-input"
                min="0"
              />
            </div>
          </div>

          {/* ✅ FASTING FILTER */}
          <div className="filter-group">
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={fastingRequired}
                onChange={(e) => handleFastingFilter(e.target.checked)}
                className="checkbox-input"
              />
              <span className="checkbox-label">Fasting Required</span>
            </label>
          </div>
        </aside>

        {/* ✅ MAIN CONTENT */}
        <main className="filters-content">

      {/* ✅ LOADING STATE */}
      {loading && tests.length === 0 ? (
        <LoadingSpinner />
      ) : tests.length === 0 ? (
        <div className="empty-state">
          <p>📭 No tests found. Try a different search or category.</p>
        </div>
      ) : (
        <>
          {/* ✅ TESTS GRID */}
          <div className="tests-grid">
            {tests.map((test) => (
              <div
                key={test.id}
                className="test-card"
              >
                {/* ✅ TEST INFO */}
                <div className="card-header">
                  <h3>{test.testName || test.name}</h3>
                  <span className="category-badge">{test.categoryName || test.category}</span>
                </div>

                <p className="test-description">
                  {test.methodology || test.description || `${test.testType || 'Lab'} test`}
                </p>

                {/* ✅ TEST DETAILS */}
                <div className="test-details">
                  {test.fastingRequired && (
                    <span className="detail-badge fasting">
                      ⏱️ Fasting: {test.fastingHours ? `${test.fastingHours}h` : 'Required'}
                    </span>
                  )}
                  <span className="detail-badge">
                    🧪 {test.testType || 'Blood'}
                  </span>
                  <span className="detail-badge">
                    ⏳ {test.reportTimeHours || test.turnaroundTime || 24}h
                  </span>
                </div>

                {/* ✅ CARD FOOTER */}
                <div className="card-footer">
                  <div className="price">₹{test.price}</div>
                  <button
                    className={`add-btn ${addingToCart === test.id ? 'loading' : ''}`}
                    onClick={() => handleAddToCart(test.id)}
                    disabled={addingToCart === test.id}
                  >
                    {addingToCart === test.id ? '⏳...' : '🛒 Add to Cart'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ✅ PAGINATION */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="page-btn prev"
              >
                ← Previous
              </button>

              <div className="page-numbers">
                {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => (
                  <button
                    key={i}
                    className={`page-num ${currentPage === i ? 'active' : ''}`}
                    onClick={() => handlePageChange(i)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
                className="page-btn next"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
        </main>
      </div>
    </div>
  );
}
