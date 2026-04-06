import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, FileBarChart2, Users, Check } from 'lucide-react';
import { packageService, TestPackageResponse } from '../../services/packageService';
import { useCart } from '../../hooks/useCart';

/* ─── Tier Config ────────────────────────────────────────────────── */
const TIER_CONFIG: Record<string, { label: string; badgeBg: string; badgeText: string; gradient: string }> = {
  SILVER:   { label: 'SILVER',   badgeBg: '#94A3B8', badgeText: '#fff', gradient: 'linear-gradient(135deg,#334155 0%,#64748B 100%)' },
  GOLD:     { label: 'GOLD',     badgeBg: '#F59E0B', badgeText: '#fff', gradient: 'linear-gradient(135deg,#92400E 0%,#F59E0B 100%)' },
  PLATINUM: { label: 'PLATINUM', badgeBg: '#9333EA', badgeText: '#fff', gradient: 'linear-gradient(135deg,#4C1D95 0%,#A855F7 100%)' },
  ADVANCED: { label: 'ADVANCED', badgeBg: '#0D7C7C', badgeText: '#fff', gradient: 'linear-gradient(135deg,#004E4E 0%,#2DD4BF 100%)' },
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  "Men's Health":    'linear-gradient(135deg,#1E3A5F 0%,#2563EB 100%)',
  "Women's Health":  'linear-gradient(135deg,#831843 0%,#EC4899 100%)',
  'Couple':          'linear-gradient(135deg,#7C2D12 0%,#F97316 100%)',
  'Child':           'linear-gradient(135deg,#14532D 0%,#4ADE80 100%)',
  'Senior Citizen':  'linear-gradient(135deg,#1E1B4B 0%,#6366F1 100%)',
  'Vitamins':        'linear-gradient(135deg,#713F12 0%,#EAB308 100%)',
};

const MOCK_PACKAGES: TestPackageResponse[] = [
  { id: 101, name: 'MedSync Comprehensive Full Body', packageName: 'MedSync Comprehensive Full Body', packageCode: 'CFB01', description: 'Master Health Checkup', price: 9500, discountedPrice: 4999, discountPercentage: 47, savings: 4501, totalTests: 45, tests: [], category: 'Full Body', isPopular: true },
  { id: 102, name: 'Advanced Full Body Checkup', packageName: 'Advanced Full Body Checkup', packageCode: 'FB02', description: 'Comprehensive checkup', price: 4500, discountedPrice: 2999, discountPercentage: 33, savings: 1501, totalTests: 85, tests: [], category: 'Full Body', isPopular: true },
  { id: 103, name: 'Women Wellness Gold', packageName: 'Women Wellness Gold', packageCode: 'WW02', description: 'Essential female screenings', price: 3500, discountedPrice: 1999, discountPercentage: 42, savings: 1501, totalTests: 62, tests: [], category: "Women's Health", isPopular: true },
  { id: 104, name: 'Senior Citizen Care Platinum', packageName: 'Senior Citizen Care Platinum', packageCode: 'SR03', description: 'Geriatric health panel', price: 5500, discountedPrice: 3899, discountPercentage: 29, savings: 1601, totalTests: 92, tests: [], category: 'Senior Citizen', isPopular: true },
  { id: 105, name: 'Diabetes Management Silver', packageName: 'Diabetes Management Silver', packageCode: 'DM04', description: 'Blood sugar control screen', price: 1500, discountedPrice: 999, discountPercentage: 33, savings: 501, totalTests: 12, tests: [], category: 'Vitamins', isPopular: true },
  { id: 106, name: 'Heart Health Advanced', packageName: 'Heart Health Advanced', packageCode: 'HH05', description: 'Cardiac markers & risk profile', price: 4200, discountedPrice: 2499, discountPercentage: 40, savings: 1701, totalTests: 48, tests: [], category: 'Heart', isPopular: true },
  { id: 107, name: 'MedSync Vital Organs Check', packageName: 'MedSync Vital Organs Check', packageCode: 'VO06', description: 'Liver, Kidney, Thyroid screen', price: 3000, discountedPrice: 1599, discountPercentage: 46, savings: 1401, totalTests: 35, tests: [], category: 'Full Body', isPopular: true },
  { id: 108, name: 'Executive Health Package', packageName: 'Executive Health Package', packageCode: 'EH07', description: 'Stress & lifestyle markers', price: 6000, discountedPrice: 3499, discountPercentage: 41, savings: 2501, totalTests: 72, tests: [], category: 'Full Body', isPopular: true },
  { id: 109, name: 'Immunity Booster Profile', packageName: 'Immunity Booster Profile', packageCode: 'IB08', description: 'Vitamins & CBC profile', price: 2500, discountedPrice: 1299, discountPercentage: 48, savings: 1201, totalTests: 24, tests: [], category: 'Vitamins', isPopular: true },
];

const getGradient = (pkg: TestPackageResponse): string => {
  if (CATEGORY_GRADIENTS[pkg.category]) return CATEGORY_GRADIENTS[pkg.category];
  const tier = pkg.name?.toUpperCase().match(/SILVER|GOLD|PLATINUM|ADVANCED/)?.[0];
  return (tier && TIER_CONFIG[tier]?.gradient) ?? 'linear-gradient(135deg,#006D77 0%,#2DD4BF 100%)';
};

const getTier = (name: string): keyof typeof TIER_CONFIG | null => {
  const match = name?.toUpperCase().match(/SILVER|GOLD|PLATINUM|ADVANCED/);
  return match ? (match[0] as keyof typeof TIER_CONFIG) : null;
};

const PackageCard: React.FC<{ pkg: TestPackageResponse }> = ({ pkg }) => {
  const navigate = useNavigate();
  const { addPackage, isInCart } = useCart();
  const inCart = isInCart(undefined, pkg.id);
  const tier = getTier(pkg.name || pkg.packageName);
  const tierCfg = tier ? TIER_CONFIG[tier] : null;
  const gradient = getGradient(pkg);
  const discount = pkg.discountPercentage || (pkg.price ? Math.round(((pkg.price - pkg.discountedPrice) / pkg.price) * 100) : 0);

  return (
    <div className="shrink-0 w-[270px] rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-200 hover:-translate-y-1 cursor-pointer bg-white">
      {/* Top gradient section */}
      <div
        className="relative p-5 flex flex-col gap-2"
        style={{ background: gradient, minHeight: '120px' }}
        onClick={() => navigate(`/packages`)}
      >
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 blur-2xl pointer-events-none translate-x-8 -translate-y-8" />
        {tierCfg && (
          <span className="self-start text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full" style={{ background: tierCfg.badgeBg, color: tierCfg.badgeText }}>
            {tierCfg.label}
          </span>
        )}
        <h3 className="text-[15px] font-black text-white leading-tight pr-2 line-clamp-2">{pkg.name || pkg.packageName}</h3>
        <p className="text-[11px] text-white/75 font-semibold">{pkg.totalTests} Tests Included</p>
      </div>
      {/* Bottom white section */}
      <div className="p-4 flex flex-col gap-3">
        <div className="space-y-1.5">
          {[{ icon: <Home className="w-3 h-3" />, text: 'Home Collection' }, { icon: <FileBarChart2 className="w-3 h-3" />, text: 'Smart Digital Report' }, { icon: <Users className="w-3 h-3" />, text: 'Doctor Consultation' },].map((h) => (
            <div key={h.text} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ background: '#D1FAE5' }}>
                <Check className="w-2.5 h-2.5 text-green-700" strokeWidth={3} />
              </div>
              <span className="text-[11px] text-slate-600 font-medium">{h.text}</span>
            </div>
          ))}
        </div>
        <div className="flex items-end gap-2">
          <span className="text-lg font-black" style={{ color: '#0D7C7C' }}>₹{pkg.discountedPrice || pkg.price}</span>
          {pkg.price > (pkg.discountedPrice || 0) && <span className="text-[11px] text-slate-400 line-through font-medium mb-0.5">₹{pkg.price}</span>}
          {discount > 0 && <span className="ml-auto text-[9px] font-black px-1.5 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100">{discount}% OFF</span>}
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/test-listing/popular-health-checkup-packages')} className="flex-1 py-2 rounded-xl border-2 text-[10px] font-black uppercase tracking-wide transition-all active:scale-95" style={{ borderColor: '#0D7C7C', color: '#0D7C7C' }}>View Details</button>
          <button onClick={() => { if (!inCart) addPackage(pkg.id, pkg.name || pkg.packageName, pkg.discountedPrice || pkg.price); }} className="flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-wide text-white transition-all active:scale-95 shadow-sm" style={{ background: inCart ? '#0D7C7C' : '#EA580C' }}>{inCart ? 'Added ✓' : 'Add to Cart'}</button>
        </div>
      </div>
    </div>
  );
};

const PopularPackagesRow: React.FC = () => {
  const [packages, setPackages] = useState<TestPackageResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isHovered = useRef(false);

  // Auto-scroll logic with infinite loop support
  useEffect(() => {
    const timer = setInterval(() => {
      if (scrollRef.current && !isHovered.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        // If we reached the end of the duplicated list, jump back to start seamlessly
        if (scrollLeft + clientWidth >= scrollWidth - 2) {
          scrollRef.current.scrollLeft = 0;
        } else {
          scrollRef.current.scrollLeft += 1.2; // Slightly faster for premium feel
        }
      }
    }, 30); // Higher frequency for smoother motion
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    packageService.getBestDeals()
      .then((data) => {
        if (data && data.length > 0) {
          setPackages(data.slice(0, 10));
        } else {
          return packageService.getAllPackages({ size: 10 });
        }
      })
      .then((data) => {
        if (data && data.length > 0) {
          setPackages(data.slice(0, 10));
        } else if (!packages.length) {
          setPackages(MOCK_PACKAGES);
        }
      })
      .catch(() => { if (!packages.length) setPackages(MOCK_PACKAGES); })
      .finally(() => setLoading(false));
  }, []);

  const scroll = (dir: 'left' | 'right') => scrollRef.current?.scrollBy({ left: dir === 'right' ? 570 : -570, behavior: 'smooth' });

  return (
    <div className="w-full">
      <div className="relative" onMouseEnter={() => (isHovered.current = true)} onMouseLeave={() => (isHovered.current = false)}>
        <button onClick={() => scroll('left')} aria-label="Scroll left" className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 w-9 h-9 rounded-full bg-white shadow-lg border border-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-all hover:scale-110 active:scale-95">
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
        </button>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 no-scrollbar"
        >
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="shrink-0 w-[270px] rounded-2xl overflow-hidden animate-pulse border border-slate-100">
                  <div className="h-[120px] bg-slate-100" />
                  <div className="p-4 space-y-3">
                    <div className="h-3 bg-slate-50 rounded w-3/4" />
                    <div className="h-3 bg-slate-50 rounded w-1/2" />
                    <div className="h-10 bg-slate-50 rounded-xl" />
                  </div>
                </div>
              ))
            : [...packages, ...packages].map((pkg, idx) => (
                <PackageCard key={`${pkg.id}-${idx}`} pkg={pkg} />
              ))
          }
        </div>

        <button onClick={() => scroll('right')} aria-label="Scroll right" className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-9 h-9 rounded-full bg-white shadow-lg border border-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-all hover:scale-110 active:scale-95">
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
        </button>
      </div>
    </div>
  );
};

export default PopularPackagesRow;
