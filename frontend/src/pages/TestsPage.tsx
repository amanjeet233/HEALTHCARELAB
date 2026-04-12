import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTests } from '@/hooks/useTests';
import { useCart } from '@/hooks/useCart';
import LandingNav from '@/components/LandingNav';
import Footer from '@/components/Footer';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import TestCard from '@/components/TestCard';
import './TestsPage.css';

export default function TestsPage() {
  const navigate = useNavigate();
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
  // ... (rest of the component state and logic remains the same)
  // Replacing only the grid content
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

  // ✅ APPLY FILTERS
  const applyFilters = async (cat: string, search: string, min: string, max: string, fasting: boolean) => {
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
      const selected = tests.find((t) => t.id === testId);
      await addTest(
        testId,
        selected?.testName || selected?.name || 'Test',
        selected?.price || 0,
        1
      );
      setCartSuccess('✅ Added to cart!');
      setTimeout(() => setCartSuccess(null), 2000);
    } catch (err) { }

    setAddingToCart(null);
  };

  return (
    <div className="tests-page bg-[#F8FAFC]">
      {/* ✅ PAGE HEADER */}
      <div className="bg-white border-b border-slate-100 py-10 px-4 text-center">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">🧪 Explore Lab Tests</h1>
        <p className="text-slate-500 font-bold uppercase text-[11px] tracking-widest mt-2 opacity-70">Professional Diagnostic Marketplace</p>
      </div>

      <div className="content-wrapper max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        {/* ✅ FILTERS SIDEBAR */}
        <aside className="w-full md:w-64 shrink-0 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Filters</h2>
              {(searchTerm || category !== 'ALL' || minPrice || maxPrice || fastingRequired) && (
                <button className="text-[10px] font-black text-red-500 uppercase tracking-tighter" onClick={handleClearFilters}>
                  Clear All
                </button>
              )}
            </div>

            {/* SEARCH */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Search</h3>
              <input
                type="text"
                placeholder="Filter results..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full bg-slate-50 border-none rounded-xl px-4 py-2 text-xs font-bold focus:ring-2 focus:ring-teal-500 transition-all"
              />
            </div>

            {/* CATEGORY */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</h3>
              <div className="flex flex-wrap gap-2">
                {['ALL', 'BLOOD', 'URINE', 'IMAGING', 'PATHOLOGY'].map(cat => (
                  <button
                    key={cat}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${category === cat ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                    onClick={() => handleCategoryChange(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* PRICE */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Price Range</h3>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => handlePriceChange(e.target.value, maxPrice)}
                  className="w-full bg-slate-50 border-none rounded-xl px-3 py-2 text-xs font-bold"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => handlePriceChange(minPrice, e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-xl px-3 py-2 text-xs font-bold"
                />
              </div>
            </div>

            {/* FASTING */}
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={fastingRequired}
                onChange={(e) => handleFastingFilter(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-200"
              />
              <span className="text-[11px] font-black text-slate-600 uppercase tracking-tight group-hover:text-slate-900 transition-colors">Fasting Required</span>
            </label>
          </div>
        </aside>

        {/* ✅ MAIN CONTENT */}
        <main className="flex-1">
          {loading && tests.length === 0 ? (
            <div className="flex justify-center py-20"><LoadingSpinner /></div>
          ) : tests.length === 0 ? (
            <div className="bg-white rounded-2xl p-20 text-center border-2 border-dashed border-slate-100">
              <p className="text-slate-400 font-black uppercase text-xs tracking-widest">No matching tests found</p>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {tests.map((test) => (
                  <TestCard 
                    key={test.id}
                    test={{
                      id: test.id,
                      name: test.testName || test.name || 'Unknown',
                      slug: test.testCode || test.slug || '',
                      category: test.categoryName || test.category || 'General',
                      price: test.price,
                      originalPrice: test.originalPrice || Math.round(test.price * 1.3),
                      shortDesc: test.shortDescription || test.description || '',
                      sampleType: test.sampleType || 'Blood',
                      fastingRequired: test.fastingRequired,
                      turnaroundTime: test.turnaroundTime || (test.reportTimeHours ? `${test.reportTimeHours}h` : '24h'),
                      rating: 4.8,
                      parametersCount: test.parametersCount,
                      isTopBooked: test.isTopBooked,
                      isTopDeal: test.isTopDeal,
                      isPackage: test.isPackage
                    }}
                    onViewDetails={(slug) => navigate(`/test/${slug}`)}
                    onBook={() => handleAddToCart(test.id)}
                  />
                ))}
              </div>

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="p-2 rounded-xl bg-white border border-slate-100 disabled:opacity-30"
                  >
                    ←
                  </button>
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
                      <button
                        key={i}
                        className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${currentPage === i ? 'bg-slate-900 text-white shadow-lg scale-110' : 'bg-white border border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                        onClick={() => handlePageChange(i)}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages - 1}
                    className="p-2 rounded-xl bg-white border border-slate-100 disabled:opacity-30"
                  >
                    →
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
