import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { labTestService } from '../services/labTest';
import type { LabTestResponse, LabTestSearchParams } from '../types/labTest';
import { FaSearch, FaFlask, FaClock, FaUtensils, FaChevronRight } from 'react-icons/fa';
import Card from '../components/common/Card';
import { notify } from '../utils/toast';

const CATEGORIES = ['All', 'Blood', 'Urine', 'Imaging', 'Pathology', 'General'];

const TestListingPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Data States
    const [tests, setTests] = useState<LabTestResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);

    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Initialize category from URL query if present
    const queryParams = new URLSearchParams(location.search);
    const initialCategory = queryParams.get('category');
    const [category, setCategory] = useState(initialCategory ? (initialCategory.charAt(0).toUpperCase() + initialCategory.slice(1)) : 'All');

    const [minPrice, setMinPrice] = useState<number | ''>('');
    const [maxPrice, setMaxPrice] = useState<number | ''>('');
    const [fastingRequired, setFastingRequired] = useState(false);
    const [page, setPage] = useState(0);

    // Debouncer
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(0);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    // Update category when URL changes (e.g., clicking different categories on landing page)
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const cat = queryParams.get('category');
        if (cat) {
            setCategory(cat.charAt(0).toUpperCase() + cat.slice(1));
        } else {
            setCategory('All');
        }
    }, [location.search]);

    // Fetch tests
    useEffect(() => {
        const fetchTests = async () => {
            setIsLoading(true);
            try {
                const params: LabTestSearchParams = {
                    page: page,
                    size: 9,
                };
                if (debouncedSearch) params.search = debouncedSearch;
                if (category && category !== 'All') params.category = category;
                if (minPrice !== '') params.minPrice = minPrice;
                if (maxPrice !== '') params.maxPrice = maxPrice;
                if (fastingRequired) params.fastingRequired = true;

                const response = await labTestService.getLabTests(params);
                setTests(response.tests || []);
                setTotalPages(response.totalPages || 1);
            } catch (error) {
                console.error(error);
                notify.error('Failed to load lab tests.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchTests();
    }, [debouncedSearch, category, minPrice, maxPrice, fastingRequired, page]);

    return (
        <div className="min-h-screen py-8">
            <div className="flex flex-col lg:flex-row gap-12">

                {/* FILTER SIDEBAR - Desktop Sticky */}
                <aside className="lg:w-80 shrink-0">
                    <div className="sticky top-24 space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black text-evergreen uppercase tracking-tighter italic">Filters</h2>
                        </div>

                                                                                        <Card
                                    key={test.id}
                                    className="group overflow-hidden border border-gray-100 hover:border-[#0D7C7C]/30 hover:shadow-lg transition-all duration-300 cursor-pointer bg-white"
                                    noPadding
                                    onClick={() => navigate(`/booking/${test.id}`)}
                                >
                                    <div className="p-6 flex flex-col h-full">
                                        <div className="flex justify-between items-start mb-4 gap-4">
                                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#0D7C7C] transition-colors leading-tight">
                                                {test.name}
                                            </h3>
                                            <div className="p-2.5 bg-[#0D7C7C]/10 rounded-xl text-[#0D7C7C] flex-shrink-0">
                                                <FaFlask className="text-xl" />
                                            </div>
                                        </div>

                                        <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 mb-6 flex-grow">
                                            {test.description || 'Provides essential insights into your health markers and indices.'}
                                        </p>

                                        <div className="flex items-center gap-4 mb-6">
                                            {test.fastingRequired && (
                                                <div className="bg-red-50 px-2.5 py-1 rounded border border-red-100 flex items-center gap-1.5 text-red-600">
                                                    <FaUtensils className="text-[10px]" />
                                                    <span className="text-[10px] font-bold">{test.fastingHours || 10}-12 Hrs Fasting</span> 
                                                </div>
                                            )}
                                            <div className="bg-blue-50 px-2.5 py-1 rounded border border-blue-100 flex items-center gap-1.5 text-blue-600">
                                                <FaClock className="text-[10px]" />
                                                <span className="text-[10px] font-bold">Reports in 24 Hrs</span>
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-100 pt-5 flex items-center justify-between mt-auto">
                                            <div>
                                                <p className="text-[10px] text-gray-500 font-semibold mb-0.5">Test Price</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xl font-bold text-gray-900">₹{test.price.toFixed(2)}</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/booking/${test.id}`);
                                                }}
                                                className="px-5 py-2.5 bg-[#FF6B6B] hover:bg-[#FF5252] text-white rounded-lg font-bold text-xs transition-colors shadow-md shadow-red-500/20"
                                            >
                                                BOOK
                                            </button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                                </div>
                            </div>

                            {/* Price Range */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-gray">Price Range ($)</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        className="w-full bg-primary/5 border border-primary/5 rounded-xl px-4 py-3 text-xs font-black text-evergreen outline-none focus:border-primary/20"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : '')}
                                    />
                                    <span className="text-muted-gray opacity-30">/</span>
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        className="w-full bg-primary/5 border border-primary/5 rounded-xl px-4 py-3 text-xs font-black text-evergreen outline-none focus:border-primary/20"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : '')}
                                    />
                                </div>
                            </div>

                            {/* Checkboxes */}
                            <label className="flex items-center space-x-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={fastingRequired}
                                    onChange={(e) => setFastingRequired(e.target.checked)}
                                    className="w-5 h-5 rounded-lg border-2 border-primary/20 text-primary focus:ring-primary/20 transition-all pointer-events-none"
                                />
                                <span className="text-[10px] font-black uppercase tracking-widest text-evergreen group-hover:text-primary transition-colors">Fasting Required</span>
                            </label>

                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setCategory('All');
                                    setMinPrice('');
                                    setMaxPrice('');
                                    setFastingRequired(false);
                                }}
                                className="w-full py-4 rounded-2xl bg-evergreen text-white text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-primary transition-all"
                            >
                                Clear All
                            </button>
                        </Card>
                    </div>
                </aside>

                {/* MAIN GRID */}
                <main className="flex-1 space-y-12">
                    <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-primary/5">
                        <div className="space-y-4">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#0D7C7C]">Diagnostic Network</span>
                            <h1 className="text-4xl md:text-5xl font-black text-evergreen uppercase tracking-tighter italic leading-none">
                                Explore <span className="text-secondary">Lab Tests</span>
                            </h1>
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-muted-gray opacity-40">
                            Showing {tests.length} tests available
                        </div>
                    </header>

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="h-[400px] bg-white/40 rounded-[2.5rem] animate-pulse shadow-inner-glow" />
                            ))}
                        </div>
                    ) : tests.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 space-y-8 bg-white/20 rounded-[4rem] border-2 border-dashed border-primary/10">
                            <FaFlask className="text-6xl text-primary/20 animate-bounce" />
                            <div className="text-center space-y-2">
                                <h3 className="text-2xl font-bold text-gray-900 tracking-tight">No Tests Found</h3>
                                <p className="text-sm font-medium text-gray-500">Try adjusting your filters or search terms.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                            {tests.map(test => (
                                <Card
                                    key={test.id}
                                    className="group"
                                    noPadding
                                    onClick={() => navigate(`/booking/${test.id}`)}
                                >
                                    <div className="p-8 flex flex-col h-full space-y-6">
                                        <div className="flex justify-between items-start">
                                            <div className="p-4 bg-primary/5 rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 transform group-hover:rotate-12">
                                                <FaFlask className="text-2xl" />
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-2xl font-black text-evergreen">${test.price.toFixed(2)}</span>
                                                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-gray opacity-40">Total Synthesis Cost</span>
                                            </div>
                                        </div>

                                        <div className="space-y-4 flex-grow">
                                            <h3 className="text-xl font-black text-evergreen uppercase tracking-tight italic group-hover:text-primary transition-colors leading-tight">
                                                {test.name}
                                            </h3>
                                            <p className="text-[10px] text-muted-gray font-bold leading-relaxed uppercase tracking-widest opacity-60 line-clamp-3">
                                                {test.description || 'Provides essential insights into your health markers and indices.'}
                                            </p>
                                        </div>

                                        <div className="pt-6 border-t border-primary/5 flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                {test.fastingRequired && (
                                                    <div className="flex items-center space-x-2 text-secondary">
                                                        <FaUtensils className="text-[10px]" />
                                                        <span className="text-[9px] font-black uppercase tracking-widest">{test.fastingHours || 8}h Fast</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center space-x-2 text-primary">
                                                    <FaClock className="text-[10px]" />
                                                    <span className="text-[9px] font-black uppercase tracking-widest">24h Ready</span>
                                                </div>
                                            </div>
                                            <FaChevronRight className="text-primary/20 group-hover:text-primary group-hover:translate-x-2 transition-all" />
                                        </div>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/booking/${test.id}`);
                                            }}
                                            className="w-full py-5 bg-primary/5 group-hover:bg-primary text-primary group-hover:text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] transition-all transform group-hover:shadow-xl shadow-primary/20"
                                        >
                                            Initialize Booking
                                        </button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Pagination - Premium Dots */}
                    {totalPages > 1 && (
                        <div className="flex justify-center space-x-3 pt-12">
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i)}
                                    className={`h-4 rounded-full transition-all duration-500 ${page === i ? 'w-12 bg-primary shadow-lg shadow-primary/30' : 'w-4 bg-primary/10 hover:bg-primary/20'
                                        }`}
                                />
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default TestListingPage;
