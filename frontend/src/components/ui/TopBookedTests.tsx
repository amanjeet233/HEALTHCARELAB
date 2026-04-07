import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FlaskConical, Droplets, Heart, Brain, Activity, Leaf, Bone, Shield, Zap, Baby } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import api from '../../services/api';

interface Test {
  id: number;
  testName?: string;
  name?: string;
  price?: number;
  originalPrice?: number;
  parametersCount?: number;
  discountPercent?: number;
  category?: string;
  categoryName?: string;
}

/* ─── HELPER: Dynamic Meta ─────────────────────────────────────── */
const getTestIcon = (name: string, category?: string) => {
  const n = (name + (category || '')).toLowerCase();
  if (n.includes('diabetes') || n.includes('sugar') || n.includes('glucose')) return { icon: Droplets, color: '#0EA5E9', bg: '#F0F9FF' };
  if (n.includes('heart') || n.includes('lipid') || n.includes('cardiac') || n.includes('cholesterol')) return { icon: Heart, color: '#E11D48', bg: '#FFF1F2' };
  if (n.includes('thyroid') || n.includes('tsh') || n.includes('brain')) return { icon: Brain, color: '#7C3AED', bg: '#F5F3FF' };
  if (n.includes('kidney') || n.includes('kft') || n.includes('creatinine') || n.includes('urea')) return { icon: Activity, color: '#D97706', bg: '#FFFBEB' };
  if (n.includes('liver') || n.includes('lft') || n.includes('leaf')) return { icon: Leaf, color: '#EA580C', bg: '#FFF7ED' };
  if (n.includes('bone') || n.includes('calcium') || n.includes('vitamin d')) return { icon: Bone, color: '#65A30D', bg: '#F7FEE7' };
  if (n.includes('immunity') || n.includes('fever') || n.includes('cbc')) return { icon: Shield, color: '#0369A1', bg: '#F0F9FF' };
  if (n.includes('vitamin') || n.includes('nutrition') || n.includes('zap')) return { icon: Zap, color: '#0891B2', bg: '#ECFEFF' };
  if (n.includes('baby') || n.includes('pregnancy')) return { icon: Baby, color: '#DB2777', bg: '#FDF2F8' };
  return { icon: FlaskConical, color: '#C2410C', bg: '#FFF7ED' };
};

/* ─── Individual Card ────────────────────────────────────────────── */
const TopTestCard: React.FC<{ test: Test }> = ({ test }) => {
  const navigate = useNavigate();
  const { addTest, isInCart } = useCart();
  const inCart = isInCart(test.id);

  const name = test.testName || test.name || 'Lab Test';
  const price = test.price ?? 0;
  
  // Stable random-ish hike seeded by ID
  const seed = (test.id % 10) / 10;
  const original = test.originalPrice ?? Math.round(price * (1.28 + seed * 0.15));
  const discount = Math.round(((original - price) / original) * 100);
  
  const params = test.parametersCount ?? (test.id % 5) + 1;
  const category = test.category || test.categoryName || 'Blood';
  const { icon: Icon, color: iconColor, bg: iconBg } = getTestIcon(name, category);

  return (
    <div
      className="relative shrink-0 w-[178px] bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-slate-100 hover:-translate-y-1 overflow-hidden group"
      style={{ borderBottom: `3px solid ${iconColor}40` }}
      onClick={() => navigate(`/lab-tests-category/${encodeURIComponent(name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''))}`)}
    >
      {/* POPULAR ribbon */}
      <div
        className="absolute top-0 right-0 text-[7px] font-black text-white px-2 py-0.5 rounded-bl-lg tracking-widest uppercase z-10"
        style={{ background: iconColor }}
      >
        TRENDING
      </div>

      <div className="p-3.5 flex flex-col gap-2 h-full">
        {/* Icon & Profession */}
        <div className="flex items-center justify-between">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm" style={{ background: iconBg }}>
            <Icon className="w-4 h-4" style={{ color: iconColor }} strokeWidth={2.5} />
          </div>
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter bg-slate-50 px-1.5 py-0.5 rounded">Expert Choice</span>
        </div>

        {/* Test name */}
        <div className="h-[34px] flex flex-col justify-center">
           <h3 className="text-[12px] font-bold text-slate-800 leading-[1.2] line-clamp-2 group-hover:text-emerald-700 transition-colors">
            {name}
          </h3>
        </div>

        {/* Professional Label */}
        <div className="flex items-center gap-1.5 -mt-0.5">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: iconColor }} />
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">Clinical Pathology</p>
        </div>

        {/* Parameters */}
        <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
          <Activity className="w-3 h-3 text-slate-300" />
          {params} Parameter{params !== 1 ? 's' : ''}
        </p>

        {/* Pricing block */}
        <div className="mt-auto pt-2 border-t border-slate-50">
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
               <span className="text-[9px] text-slate-400 line-through font-bold decoration-slate-300">₹{original}</span>
               <span className="text-[15px] font-black leading-none" style={{ color: '#0F172A' }}>
                ₹{price}
              </span>
            </div>
            {/* Discount badge */}
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100/50">
              {discount}% OFF
            </span>
          </div>
        </div>

        {/* Add button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!inCart) {
              addTest(test.id, name, price);
            }
          }}
          className="mt-1 w-full py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider text-white flex items-center justify-center gap-1 transition-all active:scale-95 shadow-sm"
          style={{
            background: inCart ? '#059669' : '#0F172A',
          }}
        >
          {inCart ? (
            <>Added ✓</>
          ) : (
            <>
              <Plus className="w-3 h-3" strokeWidth={3} />
              Book Now
            </>
          )}
        </button>
      </div>
    </div>
  );
};

/* ─── Skeleton Card ──────────────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="shrink-0 w-[178px] h-[225px] bg-white rounded-2xl border border-slate-100 animate-pulse overflow-hidden">
    <div className="p-4 space-y-3">
      <div className="flex justify-between">
        <div className="w-8 h-8 bg-slate-100 rounded-lg" />
        <div className="w-12 h-3 bg-slate-50 rounded" />
      </div>
      <div className="h-4 bg-slate-100 rounded w-full" />
      <div className="h-4 bg-slate-100 rounded w-3/4" />
      <div className="h-10 bg-slate-100 rounded-lg mt-4" />
    </div>
  </div>
);

/* ─── Main Component ─────────────────────────────────────────────── */
const TopBookedTests: React.FC = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isHovered = useRef(false);

  // Mouse drag scroll state
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  // Auto-scroll logic with infinite loop support
  useEffect(() => {
    const timer = setInterval(() => {
      if (scrollRef.current && !isHovered.current && !isDragging.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        // If we reached the end of the duplicated list, jump back to start seamlessly
        if (scrollLeft + clientWidth >= scrollWidth - 2) {
          scrollRef.current.scrollLeft = 0;
        } else {
          scrollRef.current.scrollLeft += 1.2; // Slightly faster for premium feel
        }
      }
    }, 35); // Higher frequency for smoother motion
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadTests = async () => {
      try {
        const res = await api.get('/api/lab-tests/trending');
        const data: Test[] = Array.isArray(res.data?.data) ? res.data.data : [];
        if (data.length > 0) {
          setTests(data.slice(0, 12));
        } else {
          throw new Error('empty');
        }
      } catch {
        try {
          const res2 = await api.get('/api/lab-tests', { params: { page: 0, size: 12 } });
          const content: Test[] = res2.data?.data?.content ?? [];
          setTests(content);
        } catch {
          setTests([]);
        }
      } finally {
        setLoading(false);
      }
    };
    loadTests();
  }, []);

  // Drag-to-scroll handlers
  const onMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDragging.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
    scrollRef.current.style.cursor = 'grabbing';
  };
  const onMouseLeave = () => {
    isDragging.current = false;
    isHovered.current = false;
    if (scrollRef.current) scrollRef.current.style.cursor = 'grab';
  };
  const onMouseUp = () => {
    isDragging.current = false;
    if (scrollRef.current) scrollRef.current.style.cursor = 'grab';
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.4;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'right' ? 440 : -440, behavior: 'smooth' });
  };

  return (
    <div className="w-full">
      <div 
        className="relative" 
        onMouseEnter={() => (isHovered.current = true)} 
        onMouseLeave={onMouseLeave}
      >
        {/* Left arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 w-8 h-8 rounded-full bg-white shadow-md border border-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:shadow-lg transition-all"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>

        {/* Card row */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-2 select-none no-scrollbar"
          style={{ cursor: 'grab' }}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onMouseMove={onMouseMove}
        >
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : [...tests, ...tests].map((test, idx) => (
                <TopTestCard key={`${test.id}-${idx}`} test={test} />
              ))
          }
        </div>

        {/* Right arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 w-8 h-8 rounded-full bg-white shadow-md border border-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:shadow-lg transition-all"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default TopBookedTests;
