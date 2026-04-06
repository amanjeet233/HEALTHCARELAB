import React, { useState, useLayoutEffect, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, ShoppingCart, Plus, Stethoscope, ClipboardList, Pill, User, LogOut, Gift, Calendar, FileText, Heart, Settings, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useModal } from '../../context/ModalContext';
import NotificationBell from '../notifications/NotificationBell';

// Basic useDebounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

const Header: React.FC = () => {
  const { isAuthenticated, currentUser, logout } = useAuth();
  const { cart, fetchCart, setIsCartOpen } = useCart();
  const navigate = useNavigate();
  const { openAuthModal, openModal } = useModal();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [animateBadge, setAnimateBadge] = useState(false);
  const prevCartCountRef = useRef(0);
  const searchWrapperRef = useRef<HTMLDivElement>(null);

  // Search Autocomplete State
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Load cart when authenticated
  useLayoutEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  // Trigger badge animation when cart count changes
  useLayoutEffect(() => {
    const currentCount = cart?.itemCount || 0;
    const prevCount = prevCartCountRef.current;

    // Animate on count increase (not on initial load)
    if (currentCount > prevCount && prevCount > 0) {
      setAnimateBadge(true);
      prevCartCountRef.current = currentCount;

      const timer = setTimeout(() => {
        setAnimateBadge(false);
      }, 600);

      return () => clearTimeout(timer);
    }

    prevCartCountRef.current = currentCount;
  }, [cart?.itemCount]);

  // Handle Autocomplete Fetch
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedSearch.trim().length < 2) {
        setSuggestions([]);
        setIsSearchOpen(false);
        return;
      }
      setIsSearching(true);
      try {
        // Use the new live search endpoint
        const res = await fetch(`/api/tests/search?q=${encodeURIComponent(debouncedSearch)}`);
        if (!res.ok) throw new Error('Search failed');
        
        const data = await res.json();
        // ApiResponse<List<LabTestDTO>> structure
        const tests = data?.data || [];
        setSuggestions(tests);
        setIsSearchOpen(true);
      } catch (e) {
        console.error('Search autocomplete error:', e);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    };
    fetchSuggestions();
  }, [debouncedSearch]);

  // Handle click outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length > 0) {
      setIsSearchOpen(false);
      navigate(`/lab-tests/all-lab-tests?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    setIsSearchOpen(false);
  };

  const quickActions = [
    { Icon: Plus, label: 'Book Test', href: '/tests', color: 'text-slate-600' },
    { Icon: Stethoscope, label: 'Consult', action: () => openModal('DOCTOR_APPROVAL'), color: 'text-[#0D7C7C]' },
    { Icon: ClipboardList, label: 'Reports', action: () => isAuthenticated ? navigate('/reports') : openAuthModal('login'), color: 'text-[#D97706]' },
    { Icon: Pill, label: 'Packages', href: '/packages', color: 'text-[#0D7C7C]' },
    { Icon: Gift, label: 'Promos', href: '/promos', color: 'text-[#EC4899]' },
  ];

  return (
    <header className="sticky top-0 left-0 right-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm flex justify-center h-18">
      {/* 🚀 Master Centered Container - Locked at 1210px */}
      <div className="w-full max-w-[1210px] px-4 md:px-6 flex items-center justify-between gap-4 h-full relative">
        {/* 1. LOGO SECTION - Left */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 z-20 group">
          <motion.div
            whileHover={{ scale: 1.08 }}
            className="bg-linear-to-br from-[#0D7C7C] to-ocean-blue p-2 rounded-xl shadow-lg"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </motion.div>
          <div className="hidden sm:flex flex-col leading-none">
            <h1 className="text-[17px] font-bold tracking-tighter italic text-slate-900 uppercase">
              HEALTHCARE<span className="text-slate-400">LAB</span>
            </h1>
            <span className="text-[8px] font-bold text-[#0D7C7C] uppercase tracking-[0.3em] mt-0.5">Intelligence</span>
          </div>
        </Link>

        {/* 2. SEARCH BAR - Centered & Flexible (Prevents Overlap) */}
        <div className="hidden md:flex lg:flex flex-1 max-w-md min-w-37.5 relative z-10 mx-2 shrink" ref={searchWrapperRef}>
          <form className="relative w-full group" onSubmit={handleSearchSubmit}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#0D7C7C]" strokeWidth={3} />
            <input
              type="text"
              placeholder="SEARCH TESTS OR PACKAGES..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => { if (suggestions.length > 0) setIsSearchOpen(true) }}
              className="w-full pl-11 pr-9 py-2.5 bg-slate-50 border border-slate-100 rounded-full focus:outline-none focus:border-[#0D7C7C] focus:bg-white transition-all text-[11px] font-bold placeholder:font-bold tracking-widest text-slate-700 shadow-inner"
            />
            {/* X clear button */}
            {searchQuery.length > 0 && (
              <button
                type="button"
                onClick={handleClearSearch}
                aria-label="Clear search"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Autocomplete Dropdown */}
          <AnimatePresence>
            {isSearchOpen && searchQuery.trim().length >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-[120%] left-0 w-full bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-50 flex flex-col"
              >
                {isSearching ? (
                  <div className="p-4 text-center text-xs font-semibold text-gray-400">Searching...</div>
                ) : suggestions.length === 0 ? (
                  <div className="p-4 text-center text-xs font-semibold text-gray-500">No matching tests found.</div>
                ) : (
                  <div className="flex flex-col">
                    {suggestions.map((test) => (
                      <button
                        key={test?.id || Math.random()}
                        onClick={() => {
                          setIsSearchOpen(false);
                          if (test.slug) {
                            navigate(`/test/${test.slug}`);
                          } else {
                            const name = test?.testName || test?.name || '';
                            setSearchQuery(name);
                            navigate(`/lab-tests/all-lab-tests?search=${encodeURIComponent(name)}`);
                          }
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-gray-50 flex flex-col gap-1 transition-colors"
                      >
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-sm font-bold text-gray-900 line-clamp-1">{test?.testName || 'Unknown Test'}</span>
                          <span className="text-xs font-black text-[#0D7C7C]">₹{Math.round(test?.price || test?.discountedPrice || 0)}</span>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{test?.categoryName || 'General'}</span>
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        setIsSearchOpen(false);
                        navigate(`/lab-tests/all-lab-tests?search=${encodeURIComponent(searchQuery)}`);
                      }}
                      className="w-full px-4 py-3 bg-slate-50 text-xs font-bold text-[#0D7C7C] hover:bg-slate-100 text-center uppercase tracking-widest transition-colors"
                    >
                      View all results for "{searchQuery}"
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 3. QUICK ACTIONS - Bold Icons (Fixed Visibility to show on md and above) */}
        <div className="hidden md:flex items-center gap-3 lg:gap-6 shrink-0 border-r border-slate-100 pr-4 lg:pr-6">
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              onClick={action.action || (() => navigate(action.href!))}
              className="flex flex-col items-center group transition-all active:scale-90"
            >
              <action.Icon className={`w-5 h-5 ${action.color} group-hover:scale-110 transition-all`} strokeWidth={3} />
              <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-700 mt-1 group-hover:text-[#0D7C7C]">
                {action.label}
              </span>
            </button>
          ))}
        </div>

        {/* 4. CART & AUTH - Right */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Cart Icon with Badge */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            animate={animateBadge ? { scale: [1, 0.95, 1.05, 1] } : {}}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            onClick={() => setIsCartOpen(true)}
            className="relative p-2.5 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            aria-label={`Shopping cart with ${cart?.itemCount || 0} items`}
          >
            <ShoppingCart className="w-5 h-5" strokeWidth={3} />
            {/* Badge - Only show when items exist */}
            {(cart?.itemCount ?? 0) > 0 && (
              <motion.span
                key={`badge-${cart?.itemCount}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                className="absolute -top-1.5 -right-1.5 bg-[#EF4444] text-white text-[9px] font-black h-5 w-5 flex items-center justify-center rounded-full shadow-lg border-2 border-white"
                role="status"
                aria-label={`${cart?.itemCount} items in cart`}
              >
                {cart?.itemCount}
              </motion.span>
            )}
          </motion.button>

          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <NotificationBell />
              <div className="relative group">
                <button className="flex items-center gap-1 p-1 hover:bg-gray-50 rounded-xl transition-all">
                  <div className="w-9 h-9 bg-linear-to-br from-[#0D7C7C] to-ocean-blue text-white rounded-full font-black text-sm flex items-center justify-center shadow-md">
                    {currentUser?.name?.charAt(0).toUpperCase()}
                  </div>
                </button>
                {/* User Dropdown */}
                <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl border border-gray-100 shadow-xl overflow-hidden z-50 hidden group-hover:block animate-in fade-in slide-in-from-top-2">
                  <div className="bg-[#0D7C7C] px-4 py-3 text-white">
                    <p className="font-bold text-sm leading-none mb-1">{currentUser?.name}</p>
                    <p className="text-[10px] opacity-80">{currentUser?.email}</p>
                  </div>
                  <div className="py-1">
                    <button onClick={() => navigate('/profile')} className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-b border-gray-50"><User size={14} /> My Profile</button>
                    <button onClick={() => navigate('/my-bookings')} className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-b border-gray-50"><Calendar size={14} /> My Bookings</button>
                    <button onClick={() => navigate('/reports')} className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-b border-gray-50"><FileText size={14} /> My Reports</button>
                    <button onClick={() => navigate('/health-insights')} className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-b border-gray-50"><Heart size={14} /> Health Insights</button>
                    <button onClick={() => navigate('/profile')} className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-b border-gray-50"><Settings size={14} /> Settings</button>
                    <button onClick={logout} className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"><LogOut size={14} /> Logout</button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => openAuthModal('login')}
                className="px-3 py-2 text-slate-800 font-bold text-[12px] uppercase tracking-widest hover:text-[#0D7C7C] transition-colors"
              >
                LOGIN
              </button>
              <button
                onClick={() => openAuthModal('register')}
                className="px-5 lg:px-7 py-2.5 bg-[#0D7C7C] text-white font-bold rounded-full hover:bg-[#084747] shadow-xl shadow-[#0D7C7C]/20 transition-all active:scale-95 text-[12px] uppercase tracking-widest"
              >
                SIGN UP
              </button>
            </div>
          )}

          {/* Mobile Menu Burger */}
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 text-slate-600">
            {isMobileMenuOpen ? <X strokeWidth={3} /> : <Menu strokeWidth={3} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
