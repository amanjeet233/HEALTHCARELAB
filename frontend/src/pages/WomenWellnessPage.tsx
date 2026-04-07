import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Home, ChevronRight, SlidersHorizontal, X } from 'lucide-react';
import MedSyncTestCard, { MedSyncTestCardData, MedSyncTestCardSkeleton } from '../components/ui/MedSyncTestCard';

/* ──────────────────────────────────────────────────────────────────
   WOMEN WELLNESS PAGE
   Route: /test-listing/women-wellness

   Two sections:
     1. Women Wellness Tests  (individual tests, isPackage=false)
     2. Women Wellness Packages (isPackage=true)

   Filter sidebar:
     - "Tests" checkbox  → show only tests
     - "Packages" checkbox → show only packages
     - (both checked or neither) → show both

   Data source: GET /api/lab-tests?category=womens-health (mixed)
   + fallback GET /api/packages?category=womens-health for packages
──────────────────────────────────────────────────────────────────*/

const ACCENT = '#BE185D';

/* ── Debounce ────────────────────────────────────────────────── */
function useDebounce<T>(value: T, ms: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

/* ── Section heading ─────────────────────────────────────────── */
const SectionHeading: React.FC<{ label: string; count: number }> = ({ label, count }) => (
  <div className="flex items-center gap-3 mb-5">
    <h2 className="text-lg font-black text-slate-800">
      {label}
      <span className="ml-2 text-base font-semibold text-slate-400">({count})</span>
    </h2>
    <div className="flex-1 h-px bg-slate-100" />
  </div>
);

/* ── Filter sidebar (inline, lighter than full TestListingLayout) */
interface SidebarProps {
  typeFilter: string[];
  onChange: (v: string[]) => void;
  onClearAll: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const toggle = (arr: string[], val: string) =>
  arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];

const WomenSidebar: React.FC<SidebarProps> = ({
  typeFilter, onChange, onClearAll, mobileOpen, onMobileClose,
}) => {
  const hasFilters = typeFilter.length > 0;

  const inner = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 shrink-0">
        <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4" style={{ color: ACCENT }} />
          Filters
        </h2>
        <div className="flex items-center gap-3">
          {hasFilters && (
            <button
              onClick={onClearAll}
              className="text-[12px] font-bold hover:underline"
              style={{ color: ACCENT }}
            >
              Clear All
            </button>
          )}
          <button onClick={onMobileClose} className="md:hidden p-1 rounded-lg hover:bg-slate-100">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Type section */}
      <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-3">
        Type of Tests
      </p>
      <div className="flex flex-col gap-2">
        {['Tests', 'Packages'].map(t => (
          <label key={t} className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              id={`women-type-${t}`}
              checked={typeFilter.includes(t)}
              onChange={() => onChange(toggle(typeFilter, t))}
              className="w-4 h-4 rounded cursor-pointer"
              style={{ accentColor: ACCENT }}
            />
            <span className="text-[13px] text-slate-600 group-hover:text-slate-900 transition-colors">
              {t}
            </span>
          </label>
        ))}
      </div>

      {/* Women-specific filters */}
      <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-3 mt-5">
        Category
      </p>
      <div className="flex flex-col gap-2">
        {[
          'PCOD / PCOS', 'Pregnancy', 'Hormones', 'Thyroid',
          'Bone Health', 'Iron Studies', 'Fertility', 'STI Screening',
        ].map(cat => (
          <label key={cat} className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              id={`women-cat-${cat}`}
              checked={typeFilter.includes(cat)}
              onChange={() => onChange(toggle(typeFilter, cat))}
              className="w-4 h-4 rounded cursor-pointer"
              style={{ accentColor: ACCENT }}
            />
            <span className="text-[13px] text-slate-600 group-hover:text-slate-900 transition-colors">
              {cat}
            </span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 sticky top-20 self-start max-h-[calc(100vh-88px)] bg-white rounded-2xl border border-slate-100 shadow-sm p-5 overflow-y-auto no-scrollbar">
        {inner}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden" onClick={onMobileClose}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <div
            className="relative ml-auto w-72 h-full bg-white shadow-2xl p-5 overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {inner}
          </div>
        </div>
      )}
    </>
  );
};

/* ─────────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────────── */
const WomenWellnessPage: React.FC = () => {
  const [allItems, setAllItems] = useState<MedSyncTestCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  /* ── SEO ──────────────────────────────────────────────────── */
  useEffect(() => {
    document.title = 'Women Wellness Tests — MedSync Lab Tests';
  }, []);

  /* ── Fetch ────────────────────────────────────────────────── */
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      // Primary: filter by WOMENS_HEALTH category via Spring Boot /filter
      const p = new URLSearchParams();
      p.append('page', '0');
      p.append('size', '60');
      p.append('category', "WOMEN'S_HEALTH");

      const res = await fetch(
        `http://localhost:8080/api/lab-tests/filter?${p.toString()}`,
        { headers: { Accept: 'application/json' } }
      );
      const result = await res.json();

      let raw: any[] = [];
      if (result.success && result.data) {
        raw = result.data.content ?? [];
      } else if (result.tests) {
        raw = result.tests;
      } else if (Array.isArray(result)) {
        raw = result;
      }

      // Normalise field names
      const normalised: MedSyncTestCardData[] = raw.map((t: any) => ({
        ...t,
        name:            t.testName       ?? t.packageName ?? t.name ?? 'Unknown',
        originalPrice:   t.originalPrice  ?? t.mrpPrice    ?? t.price,
        parametersCount: t.parametersCount ?? t.totalTests ?? t.testsCount,
        category:        t.categoryName   ?? t.category,
        canonicalTag:    t.canonicalTag   ?? t.slug        ?? t.testCode ?? String(t.id),
        isPackage:       t.isPackage      ?? (t.itemType === 'PACKAGE'),
        itemType:        t.itemType       ?? (t.isPackage ? 'PACKAGE' : 'TEST'),
      }));

      setAllItems(normalised);
    } catch {
      setAllItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ── Split by type ────────────────────────────────────────── */
  const tests    = useMemo(() => allItems.filter(i => !i.isPackage && i.itemType !== 'PACKAGE'), [allItems]);
  const packages = useMemo(() => allItems.filter(i => i.isPackage || i.itemType === 'PACKAGE'), [allItems]);

  /* ── Visibility based on type filter ─────────────────────── */
  const showTests    = typeFilter.length === 0 || typeFilter.includes('Tests');
  const showPackages = typeFilter.length === 0 || typeFilter.includes('Packages');

  const clearAll = () => setTypeFilter([]);

  /* ── Active pills ─────────────────────────────────────────── */
  const pills = typeFilter.filter(t => t === 'Tests' || t === 'Packages');

  const skeletonGrid = (n = 6, isPkg = false) => (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4">
      {Array.from({ length: n }).map((_, i) => (
        <MedSyncTestCardSkeleton key={i} />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-transparent">

      {/* ── Hero header ─────────────────────────────────────── */}
      <div
        className="w-full px-4 md:px-8 pt-6 pb-6"
        style={{
          background: `linear-gradient(135deg, ${ACCENT}12 0%, white 70%)`,
          borderBottom: `2px solid ${ACCENT}22`,
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
            <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
            <li className="font-semibold text-slate-700">Women Wellness</li>
          </ol>
        </nav>

        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-slate-800 leading-tight">
              💜 Women Wellness
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Comprehensive health panels for PCOD, hormones, pregnancy & more
            </p>
          </div>

          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden self-start flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 shadow-sm"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────── */}
      <div className="flex gap-6 px-4 md:px-8 py-6">

        {/* Filter sidebar */}
        <WomenSidebar
          typeFilter={typeFilter}
          onChange={v => setTypeFilter(v)}
          onClearAll={clearAll}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />

        {/* Right pane */}
        <div className="flex-1 min-w-0">

          {/* Active filter pills */}
          {pills.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {pills.map(p => (
                <span
                  key={p}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold border"
                  style={{ borderColor: `${ACCENT}44`, color: ACCENT, background: `${ACCENT}10` }}
                >
                  {p}
                  <button onClick={() => setTypeFilter(typeFilter.filter(x => x !== p))}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* ── Tests section ─────────────────────────────── */}
          {showTests && (
            <section className="mb-10">
              {loading ? (
                <>
                  <div className="h-7 w-56 bg-slate-200 rounded animate-pulse mb-5" />
                  {skeletonGrid(6, false)}
                </>
              ) : (
                <>
                  <SectionHeading label="Women Wellness Tests" count={tests.length} />
                  {tests.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4">
                      {tests.map(item => (
                        <MedSyncTestCard key={`test-${item.id}`} item={item} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-400">
                      <p className="text-4xl mb-3">🔬</p>
                      <p className="text-sm font-bold">No individual tests found</p>
                    </div>
                  )}
                </>
              )}
            </section>
          )}

          {/* Divider between sections */}
          {showTests && showPackages && !loading && packages.length > 0 && (
            <div className="border-t border-slate-100 mb-10" />
          )}

          {/* ── Packages section ──────────────────────────── */}
          {showPackages && (
            <section>
              {loading ? (
                <>
                  <div className="h-7 w-56 bg-slate-200 rounded animate-pulse mb-5" />
                  {skeletonGrid(3, true)}
                </>
              ) : (
                <>
                  <SectionHeading label="Women Wellness Packages" count={packages.length} />
                  {packages.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4">
                      {packages.map(item => (
                        <MedSyncTestCard key={`pkg-${item.id}`} item={item} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-400">
                      <p className="text-4xl mb-3">📦</p>
                      <p className="text-sm font-bold">No packages found</p>
                    </div>
                  )}
                </>
              )}
            </section>
          )}

          {/* Empty state when both types are filtered out */}
          {!loading && !showTests && !showPackages && (
            <div className="text-center py-24">
              <p className="text-5xl mb-4">💜</p>
              <p className="text-lg font-black text-slate-700">No results</p>
              <button
                onClick={clearAll}
                className="mt-4 px-6 py-2.5 rounded-xl text-white text-sm font-bold"
                style={{ background: ACCENT }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WomenWellnessPage;
