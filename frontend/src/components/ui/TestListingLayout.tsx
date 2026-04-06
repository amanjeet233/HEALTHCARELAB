import React, {
  useState, useEffect, useCallback
} from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Home, ChevronRight, X, SlidersHorizontal, ChevronDown } from 'lucide-react';
import MedSyncTestCard, { MedSyncTestCardSkeleton, MedSyncTestCardData } from './MedSyncTestCard';

/* ─────────────────────────────────────────────────────────────────
   TestListingLayout — Reusable layout for all test listing routes:
     /lab-tests/all-lab-tests
     /test-listing/top-booked-tests
     /test-listing/women-wellness
     /lab-tests-category/:categorySlug

   @agent: frontend-specialist  @perf: performance-optimizer
───────────────────────────────────────────────────────────────── */

const ALL_CATEGORIES = [
  'Full Body Checkup', 'Diabetes', 'Heart', 'Thyroid', 'Kidney', 'Liver',
  "Women's Health", 'Senior Citizen', 'Pregnancy', 'Bone Health',
  'Cancer Screening', 'Immunity', "Men's Health", 'Sexual Health',
  'Vitamin', 'Hormone', 'Joint', 'Allergy', 'Arthritis', 'Fever',
  'Infection', 'Iron Deficiency', 'CBC', 'Lipid Profile', 'Urine',
  'Pre-marital', 'Nutrition', 'Imaging', 'STI / STD',
  'Eyes', 'Lungs', 'Digestion', 'Stress', 'Skin/Hair', 'Weight',
  'Pediatric', 'Fitness', 'Vitality', 'Healthy Wellness'
];

const MUST_HAVE_TESTS = [
  { id: 'cbc',    label: 'CBC (Complete Blood Count)' },
  { id: 'lipid',  label: 'Lipid Profile' },
  { id: 'thyroid',label: 'Thyroid Profile (TSH)' },
  { id: 'hba1c',  label: 'HbA1c (Diabetes)' },
  { id: 'lft',    label: 'Liver Function Test' },
  { id: 'kft',    label: 'Kidney Function Test' },
  { id: 'vitd',   label: 'Vitamin D Total' },
  { id: 'vitb12', label: 'Vitamin B12' },
  { id: 'urine',  label: 'Urine Routine' },
  { id: 'psa',    label: 'PSA (Prostate)' },
];

const SORT_OPTIONS = [
  { value: 'relevance',        label: 'Relevance' },
  { value: 'price_low',        label: 'Price: Low to High' },
  { value: 'price_high',       label: 'Price: High to Low' },
  { value: 'discount',         label: 'Discount %' },
  { value: 'popular',          label: 'Most Booked' },
];

const ITEMS_PER_PAGE = 18;

/* ── Debounce hook ────────────────────────────────────────────── */
function useDebounce<T>(value: T, delay: number): T {
  const [deb, setDeb] = useState<T>(value);
  useEffect(() => {
    const t = setTimeout(() => setDeb(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return deb;
}

/* ── Pagination helper ────────────────────────────────────────── */
const pageNumbers = (current: number, total: number): (number | '…')[] => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '…', total];
  if (current >= total - 3) return [1, '…', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '…', current - 1, current, current + 1, '…', total];
};

/* ── Props ────────────────────────────────────────────────────── */
export interface TestListingLayoutProps {
  /** Page heading e.g. "Top Booked Tests" */
  title: string;
  /** Breadcrumb label */
  breadcrumb?: string;
  /** Pre-selected category filter (e.g. from /lab-tests-category/:slug) */
  defaultCategory?: string;
  /** When true, only show packages */
  packagesOnly?: boolean;
  /** When true, sort by most_booked by default */
  trendingMode?: boolean;
  /** Accent colour (default teal) */
  accent?: string;
  /** When true, hide Category section in sidebar (already on a category page) */
  hideCategoryFilter?: boolean;
  /** Pre-applied search from URL query string */
  initialSearch?: string;
}

/* ═══════════════════════════════════════════════════════════════
   FILTER SIDEBAR
═══════════════════════════════════════════════════════════════ */
interface SidebarProps {
  typeFilter: string[];
  mustHaveFilter: string[];
  categoryFilter: string[];
  priceRange: [number, number];
  onTypeChange: (val: string[]) => void;
  onMustHaveChange: (val: string[]) => void;
  onCategoryChange: (val: string[]) => void;
  onPriceChange: (val: [number, number]) => void;
  onClearAll: () => void;
  accent: string;
  mobileOpen: boolean;
  onMobileClose: () => void;
  hideCategoryFilter?: boolean;
  searchQuery: string;
  onSearchChange: (val: string) => void;
}

const FilterSidebar: React.FC<SidebarProps> = ({
  typeFilter, mustHaveFilter, categoryFilter, priceRange,
  onTypeChange, onMustHaveChange, onCategoryChange, onPriceChange,
  onClearAll, accent, mobileOpen, onMobileClose, hideCategoryFilter,
  searchQuery, onSearchChange
}) => {
  const [showAllCats,  setShowAllCats]  = useState(false);
  const [showMoreMust, setShowMoreMust] = useState(false);

  const toggle = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];

  const visibleCats  = showAllCats  ? ALL_CATEGORIES        : ALL_CATEGORIES.slice(0, 8);
  const visibleMust  = showMoreMust ? MUST_HAVE_TESTS        : MUST_HAVE_TESTS.slice(0, 5);

  const hasFilters = typeFilter.length + mustHaveFilter.length + categoryFilter.length > 0
    || priceRange[0] > 0 || priceRange[1] < 15000;

  const CheckRow: React.FC<{
    id: string; label: string; checked: boolean; onChange: () => void
  }> = ({ id, label, checked, onChange }) => (
    <label
      htmlFor={id}
      className={`flex items-center gap-3 cursor-pointer group py-2 px-3 rounded-xl transition-all duration-200 ${
        checked ? 'bg-orange-50 border-orange-100' : 'hover:bg-slate-50 border-transparent'
      } border`}
    >
      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
        checked ? 'bg-[#C2410C] border-[#C2410C]' : 'border-slate-300 bg-white group-hover:border-[#C2410C]'
      }`}>
        {checked && (
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <input
        id={id} type="checkbox" checked={checked} onChange={onChange}
        className="sr-only"
      />
      <span className={`text-[14px] font-semibold transition-colors leading-tight ${
        checked ? 'text-[#C2410C]' : 'text-slate-700 group-hover:text-slate-900'
      }`}>
        {label}
      </span>
    </label>
  );

  const Section: React.FC<{ title: string; children: React.ReactNode; isScrollable?: boolean }> = ({ title, children, isScrollable }) => (
    <div className="border-b border-slate-100/80 pb-5 mb-5 last:border-0 last:pb-0 last:mb-0">
      <div className="flex items-center justify-between mb-3.5">
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em]">{title}</p>
        {isScrollable && <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />}
      </div>
      <div className={`flex flex-col gap-1.5 ${isScrollable ? 'max-h-[280px] overflow-y-auto premium-scrollbar pr-1.5' : ''}`}>
        {children}
      </div>
    </div>
  );

  const inner = (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 shrink-0 pb-4 border-b border-slate-50">
        <h2 className="text-[17px] font-black text-slate-800 flex items-center gap-2.5">
          <SlidersHorizontal className="w-4.5 h-4.5" style={{ color: accent }} strokeWidth={2.5} />
          Filters
        </h2>
        <div className="flex items-center gap-3">
          {hasFilters && (
            <button
              onClick={onClearAll}
              className="text-[12px] font-extrabold hover:text-slate-900 transition-colors uppercase tracking-wider"
              style={{ color: accent }}
            >
              Clear All
            </button>
          )}
          <button
            onClick={onMobileClose}
            className="md:hidden p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Internal Search Box (Prompt 7) */}
      <div className="mb-6 relative">
          <input 
              type="text"
              placeholder="Search tests..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-[13px] font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-100 placeholder:text-slate-400 transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {searchQuery && (
                  <button onClick={() => onSearchChange('')} className="p-1 hover:bg-slate-100 rounded-lg">
                      <X className="w-3 h-3 text-slate-400" />
                  </button>
              )}
          </div>
      </div>

      <div className="overflow-y-auto flex-1 pr-1 premium-scrollbar">
        {/* Type of Tests */}
        <Section title="Type of Tests">
          {['Top Deals', 'Tests', 'Packages', 'Must Have Tests'].map(t => (
            <CheckRow
              key={t} id={`type-${t}`} label={t}
              checked={typeFilter.includes(t)}
              onChange={() => onTypeChange(toggle(typeFilter, t))}
            />
          ))}
        </Section>

        {/* Must Have Tests */}
        <Section title="Must Have Tests" isScrollable={showMoreMust}>
          {visibleMust.map(t => (
            <CheckRow
              key={t.id} id={`must-${t.id}`} label={t.label}
              checked={mustHaveFilter.includes(t.id)}
              onChange={() => onMustHaveChange(toggle(mustHaveFilter, t.id))}
            />
          ))}
        </Section>
        <button
          onClick={() => setShowMoreMust(!showMoreMust)}
          className="text-[12px] font-bold mb-4 hover:underline transition-colors block"
          style={{ color: accent }}
        >
          {showMoreMust
            ? '− Show Less'
            : `+ ${MUST_HAVE_TESTS.length - 5} more`}
        </button>

        {/* Categories — hidden when already on a category page */}
        {!hideCategoryFilter && (
          <>
            <Section title="Category" isScrollable={showAllCats}>
              {visibleCats.map(cat => (
                <CheckRow
                  key={cat} id={`cat-${cat}`} label={cat}
                  checked={categoryFilter.includes(cat)}
                  onChange={() => onCategoryChange(toggle(categoryFilter, cat))}
                />
              ))}
            </Section>
            <button
              onClick={() => setShowAllCats(!showAllCats)}
              className="text-[12px] font-bold mb-4 hover:underline transition-colors block"
              style={{ color: accent }}
            >
              {showAllCats
                ? '− Show Less'
                : `+ ${ALL_CATEGORIES.length - 8} more`}
            </button>
          </>
        )}

        {/* Price Range */}
        <Section title="Price Range">
          <div className="px-1">
            <div className="flex justify-between text-[12px] text-slate-500 font-semibold mb-3">
              <span>₹{priceRange[0].toLocaleString('en-IN')}</span>
              <span>₹{priceRange[1].toLocaleString('en-IN')}</span>
            </div>
            {/* dual-range using two transparent range inputs overlaid */}
            <div className="relative h-5">
              <input
                type="range" min={0} max={15000} step={100}
                value={priceRange[0]}
                onChange={e => {
                  const v = Number(e.target.value);
                  if (v < priceRange[1]) onPriceChange([v, priceRange[1]]);
                }}
                className="absolute w-full h-1 rounded appearance-none cursor-pointer"
                style={{ accentColor: accent }}
                aria-label="Minimum price"
              />
              <input
                type="range" min={0} max={15000} step={100}
                value={priceRange[1]}
                onChange={e => {
                  const v = Number(e.target.value);
                  if (v > priceRange[0]) onPriceChange([priceRange[0], v]);
                }}
                className="absolute w-full h-1 rounded appearance-none cursor-pointer"
                style={{ accentColor: accent }}
                aria-label="Maximum price"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-2 text-center">
              ₹0 – ₹15,000
            </p>
          </div>
        </Section>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-72 shrink-0 sticky top-24 self-start max-h-[calc(100vh-100px)] bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/40 p-6 font-['Figtree']">
        {inner}
      </aside>

      {/* Mobile overlay drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden" onClick={onMobileClose}>
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
          <div
            className="relative ml-auto w-72 h-full bg-white shadow-2xl flex flex-col p-6 font-['Figtree'] animate-in slide-in-from-right duration-300"
            onClick={e => e.stopPropagation()}
          >
            {inner}
          </div>
        </div>
      )}
    </>
  );
};

/* ═══════════════════════════════════════════════════════════════
   ACTIVE FILTER PILLS
═══════════════════════════════════════════════════════════════ */
const FilterPills: React.FC<{
  typeFilter: string[];
  categoryFilter: string[];
  mustHaveFilter: string[];
  priceRange: [number, number];
  onRemoveType: (v: string) => void;
  onRemoveCat: (v: string) => void;
  onRemoveMust: (v: string) => void;
  onResetPrice: () => void;
  accent: string;
}> = ({
  typeFilter, categoryFilter, mustHaveFilter, priceRange,
  onRemoveType, onRemoveCat, onRemoveMust, onResetPrice, accent,
}) => {
  const hasPriceFilter = priceRange[0] > 0 || priceRange[1] < 15000;
  const all = [
    ...typeFilter.map(v => ({ label: v, onRemove: () => onRemoveType(v) })),
    ...categoryFilter.map(v => ({ label: v, onRemove: () => onRemoveCat(v) })),
    ...mustHaveFilter.map(id => ({
      label: MUST_HAVE_TESTS.find(t => t.id === id)?.label ?? id,
      onRemove: () => onRemoveMust(id),
    })),
    ...(hasPriceFilter
      ? [{
          label: `₹${priceRange[0]}–₹${priceRange[1]}`,
          onRemove: onResetPrice,
        }]
      : []),
  ];

  if (!all.length) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {all.map(({ label, onRemove }) => (
        <span
          key={label}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-[12px] font-bold border bg-white shadow-sm transition-all hover:shadow-md group"
          style={{ borderColor: `${accent}20`, color: accent }}
        >
          {label}
          <button 
            onClick={onRemove} 
            aria-label={`Remove filter ${label}`}
            className="p-0.5 rounded-md hover:bg-slate-100 transition-colors"
          >
            <X className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
          </button>
        </span>
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN LAYOUT
═══════════════════════════════════════════════════════════════ */
const TestListingLayout: React.FC<TestListingLayoutProps> = ({
  title,
  breadcrumb,
  defaultCategory,
  packagesOnly = false,
  trendingMode = false,
  accent = '#0D7C7C',
  hideCategoryFilter = false,
}) => {
  const [urlParams] = useSearchParams();
  const initialSearch = urlParams.get('search') ?? '';
  const initialCategory = urlParams.get('category') ?? '';

  /* ── Filter State ─────────────────────────────────────────── */
  const [typeFilter,     setTypeFilter]     = useState<string[]>([]);
  const [mustHaveFilter, setMustHaveFilter] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string[]>(
    initialCategory ? [initialCategory] : (defaultCategory ? [defaultCategory] : [])
  );
  const [priceRange,     setPriceRange]     = useState<[number, number]>([0, 15000]);
  const [sortBy,         setSortBy]         = useState(
    trendingMode ? 'most_booked' : 'relevance'
  );
  const [page,           setPage]           = useState(1);
  const [mobileOpen,     setMobileOpen]     = useState(false);
  const [searchQuery,    setSearchQuery]    = useState(initialSearch || '');

  /* ── Data State ───────────────────────────────────────────── */
  const [items,       setItems]       = useState<MedSyncTestCardData[]>([]);
  const [totalCount,  setTotalCount]  = useState(0);
  const [totalPages,  setTotalPages]  = useState(1);
  const [loading,     setLoading]     = useState(true);

  /* ── Debounced filters (300ms) ─────────────────────────────── */
  const debType        = useDebounce(typeFilter,     300);
  const debMust        = useDebounce(mustHaveFilter, 300);
  const debCategory    = useDebounce(categoryFilter, 300);
  const debPriceRange  = useDebounce(priceRange,     300);
  const debSearchQuery = useDebounce(searchQuery,    300);

  useEffect(() => {
    if (initialCategory) {
      setCategoryFilter(prev => prev.includes(initialCategory) ? prev : [initialCategory]);
    }
  }, [initialCategory]);

  /* ── Fetch — fixed URL + category encoding + debug logging ── */
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      p.append('page', String(page));
      p.append('limit', String(ITEMS_PER_PAGE));

      // 1. Category filter
      const cats = [
        ...(defaultCategory ? [defaultCategory] : []),
        ...debCategory,
      ].filter(c => c && c !== 'All Lab Tests');

      if (cats.length > 0) {
        Array.from(new Set(cats)).forEach(c => p.append('category', c));
      }

      // 2. Search
      if (debSearchQuery) p.append('search', debSearchQuery);

      // 3. Type filter
      if (packagesOnly || debType.includes('Packages')) p.append('item_type', 'PACKAGE');
      else if (debType.includes('Tests')) p.append('item_type', 'TEST');
      
      if (debType.includes('Top Deals')) p.append('is_top_deal', 'true');
      if (debType.includes('Top Booked') || trendingMode) p.append('is_top_booked', 'true');

      // 4. Sort
      if (sortBy !== 'relevance') p.append('sort_by', sortBy);

      // Price
      if (debPriceRange[0] > 0)     p.append('min_price', String(debPriceRange[0]));
      if (debPriceRange[1] < 15000) p.append('max_price', String(debPriceRange[1]));

      const url = `/api/lab-tests/advanced?${p.toString()}`;
      console.log('[TestListingLayout] Fetching:', url);

      const res = await fetch(url, { headers: { Accept: 'application/json' } });

      if (!res.ok) {
        console.error('[TestListingLayout] API error:', res.status, res.statusText);
        setItems([]);
        setTotalCount(0);
        setTotalPages(1);
        return;
      }

      const result = await res.json();
      console.log('[TestListingLayout] API response:', result);

      // Spring Page<> format: { success, data: { content, totalPages, totalElements } }
      let raw: any[] = [];
      let total = 0;
      let pages = 1;

      if (result.success && result.data) {
        raw   = result.data.content      ?? [];
        total = result.data.totalElements ?? raw.length;
        pages = result.data.totalPages    ?? 1;
      } else if (result.data && Array.isArray(result.data)) {
        raw = result.data; total = raw.length;
      } else if (result.tests) {
        raw   = result.tests;
        total = result.total_count ?? raw.length;
        pages = result.total_pages ?? 1;
      } else if (Array.isArray(result)) {
        raw = result; total = raw.length;
      }

      console.log('[TestListingLayout] Parsed tests:', raw.length, 'total:', total);

      // Normalise field names — ensure every card has required fields
      const normalised: MedSyncTestCardData[] = raw.map((t: any) => ({
        ...t,
        id:             t.id ?? Math.random(),
        name:           t.testName ?? t.packageName ?? t.name ?? 'Unknown Test',
        originalPrice:  t.originalPrice ?? t.mrpPrice ?? t.price,
        parametersCount: t.parametersCount ?? t.totalTests ?? t.testsCount,
        category:       t.categoryName  ?? t.category ?? 'General',
        canonicalTag:   t.testCode ?? t.slug ?? t.canonicalTag ?? String(t.id),
      }));

      setItems(normalised);
      setTotalCount(total);
      setTotalPages(Math.max(1, pages));
    } catch (err) {
      console.error('[TestListingLayout] Fetch failed:', err);
      setItems([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, debType, debMust, debCategory, debPriceRange, debSearchQuery, packagesOnly, trendingMode, defaultCategory]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  /* ── Sort change → reset page ─────────────────────────────── */
  const handleSortChange = (val: string) => {
    setSortBy(val);
    setPage(1);
  };

  /* ── Clear all ────────────────────────────────────────────── */
  const clearAll = () => {
    setTypeFilter([]);
    setMustHaveFilter([]);
    setCategoryFilter(defaultCategory ? [defaultCategory] : []);
    setPriceRange([0, 15000]);
    setPage(1);
  };

  const hasBreadcrumb = !!breadcrumb;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      {/* ── Hero header ─────────────────────────────────────── */}
      <div
        className="w-full px-4 md:px-8 pt-6 pb-6"
        style={{
          background: `linear-gradient(135deg, ${accent}12 0%, white 70%)`,
          borderBottom: `2px solid ${accent}20`,
        }}
      >
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-xs text-slate-400 font-medium flex-wrap">
            <li>
              <Link to="/" className="hover:text-slate-700 transition-colors flex items-center gap-1">
                <Home className="w-3 h-3" />Home
              </Link>
            </li>
            <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
            <li>
              <Link to="/lab-tests" className="hover:text-slate-700 transition-colors">Lab Tests</Link>
            </li>
            {hasBreadcrumb && (
              <>
                <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
                <li className="text-slate-700 font-semibold">{breadcrumb}</li>
              </>
            )}
          </ol>
        </nav>

        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-2xl font-black text-slate-800 leading-tight">
            {title}
            {!loading && (
              <span className="ml-2 text-base font-semibold text-slate-400">
                ({totalCount.toLocaleString('en-IN')})
              </span>
            )}
          </h1>

          <div className="flex items-center gap-3">
            {/* Mobile filter button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 shadow-sm hover:shadow-md transition-all"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>

            {/* Sort dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={e => handleSortChange(e.target.value)}
                aria-label="Sort tests by"
                className="appearance-none pl-4 pr-9 py-2 rounded-xl border border-slate-200 bg-white text-[13px] font-bold text-slate-700 shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-200 hover:shadow-md transition-all"
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────── */}
      <div className="flex gap-6 px-4 md:px-8 py-6">

        {/* Filter sidebar */}
        <FilterSidebar
          typeFilter={typeFilter}
          mustHaveFilter={mustHaveFilter}
          categoryFilter={categoryFilter}
          priceRange={priceRange}
          onTypeChange={v => { setTypeFilter(v); setPage(1); }}
          onMustHaveChange={v => { setMustHaveFilter(v); setPage(1); }}
          onCategoryChange={v => { setCategoryFilter(v); setPage(1); }}
          onPriceChange={v => { setPriceRange(v); setPage(1); }}
          onClearAll={clearAll}
          accent={accent}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
          hideCategoryFilter={hideCategoryFilter}
          searchQuery={searchQuery}
          onSearchChange={v => { setSearchQuery(v); setPage(1); }}
        />

        {/* Right pane */}

        <div className="flex-1 min-w-0">

          {/* Search Result Banner (Prompt 7) */}
          {debSearchQuery && (
            <div className="mb-6 flex items-center justify-between bg-teal-50/50 border border-teal-100 rounded-2xl px-5 py-3 shadow-sm">
                <p className="text-sm text-slate-600 font-medium">
                    Showing results for <span className="text-teal-700 font-bold">"{debSearchQuery}"</span>
                </p>
                <button 
                    onClick={() => { setSearchQuery(''); setPage(1); }}
                    className="flex items-center gap-1.5 text-xs font-black text-teal-700 uppercase tracking-wider hover:underline"
                >
                    <X className="w-3 h-3" /> Clear Search
                </button>
            </div>
          )}

          {/* Active filter pills */}
          <FilterPills
            typeFilter={typeFilter}
            categoryFilter={categoryFilter}
            mustHaveFilter={mustHaveFilter}
            priceRange={priceRange}
            onRemoveType={v => setTypeFilter(typeFilter.filter(x => x !== v))}
            onRemoveCat={v => setCategoryFilter(categoryFilter.filter(x => x !== v))}
            onRemoveMust={v => setMustHaveFilter(mustHaveFilter.filter(x => x !== v))}
            onResetPrice={() => setPriceRange([0, 15000])}
            accent={accent}
          />

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <MedSyncTestCardSkeleton key={i} />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <span className="text-6xl">🔬</span>
              <p className="text-lg font-black text-slate-700">No tests found</p>
              <p className="text-sm text-slate-400 max-w-xs">
                Try clearing your filters or searching for a different category.
              </p>
              <button
                onClick={clearAll}
                className="mt-2 px-6 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:opacity-90"
                style={{ background: accent }}
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="medsync-test-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map(item => (
                <MedSyncTestCard key={`${item.itemType ?? 'test'}-${item.id}`} item={item} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <nav
              aria-label="Pagination"
              className="flex items-center justify-center gap-1.5 mt-10 flex-wrap"
            >
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-9 h-9 rounded-xl flex items-center justify-center border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-all font-bold text-sm"
                aria-label="Previous page"
              >
                ‹
              </button>

              {pageNumbers(page, totalPages).map((n, i) =>
                n === '…' ? (
                  <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-slate-400 text-sm">
                    …
                  </span>
                ) : (
                  <button
                    key={n}
                    onClick={() => setPage(Number(n))}
                    aria-label={`Go to page ${n}`}
                    aria-current={page === n ? 'page' : undefined}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all border"
                    style={
                      page === n
                        ? { background: accent, color: '#fff', borderColor: accent }
                        : { background: '#fff', color: '#475569', borderColor: '#e2e8f0' }
                    }
                  >
                    {n}
                  </button>
                )
              )}

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-9 h-9 rounded-xl flex items-center justify-center border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-all font-bold text-sm"
                aria-label="Next page"
              >
                ›
              </button>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestListingLayout;
