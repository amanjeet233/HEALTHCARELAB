import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Shield, Award, Droplet, Clock, Check, Plus, Minus, Info, Activity } from 'lucide-react';
import api from '../../services/api';
import { useCart } from '../../hooks/useCart';
import './PackageDetailPage.css';

const PackageDetailPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { addPackage, isInCart, setIsCartOpen } = useCart();

    const [pkg, setPkg] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'tests' | 'preparation' | 'compare'>('tests');
    const [expandedTestGroup, setExpandedTestGroup] = useState<string | null>(null);

    useEffect(() => {
        const fetchPkg = async () => {
            try {
                const res = await api.get(`/api/test-packages/code/${slug}`);
                setPkg(res.data?.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPkg();
        window.scrollTo(0, 0);
    }, [slug]);

    if (loading) {
        return <div className="packages-page packages-loading"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0D7C7C]"></div></div>;
    }

    if (!pkg) {
        return (
            <div className="packages-page">
                <div className="empty-packages">
                    <span className="empty-icon">📦</span>
                    <h3>Package not found</h3>
                    <p>Please try another package.</p>
                </div>
            </div>
        );
    }

    const inCart = isInCart(undefined, pkg.id);
    const words = String(pkg.packageName || 'Health Packages').trim().split(/\s+/);
    const heroPrimary = words[0] || 'Health';
    const heroAccent = words.slice(1).join(' ') || 'Packages';
    const formatPrice = (value: any) => {
        const n = Number(value || 0);
        return n.toLocaleString('en-IN', {
            minimumFractionDigits: n % 1 === 0 ? 0 : 2,
            maximumFractionDigits: 2,
        });
    };

    return (
        <div className="packages-page flex flex-col font-sans">
            {/* Dynamic Hero Section */}
            <div className="package-details-hero pt-6 pb-6 px-4 md:px-6 relative overflow-hidden">
                <div className="max-w-[1080px] mx-auto relative z-10 hero-grid">
                    <div className="flex-1">
                        <div className="details-eyebrow mb-6">
                            <span className="details-eyebrow-icon">
                                <Activity size={22} />
                            </span>
                            <span className="details-eyebrow-text">DIAGNOSTIC / ARSENALS</span>
                        </div>

                        <h1 className="details-hero-title">
                            {heroPrimary} <span>{heroAccent}</span>
                        </h1>
                        <p className="details-hero-subtitle">{pkg.packageName}</p>
                        <p className="details-hero-description">{pkg.bestFor || pkg.description || 'Best for annual basic checkup'}</p>

                        <div className="details-chip-row">
                            <div className="details-chip">
                                <Droplet className="w-5 h-5 text-rose-500" />
                                <div className="flex flex-col">
                                    <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Fasting</span>
                                    <span className="text-sm font-black text-slate-800">{pkg.fastingRequired ? `${pkg.fastingHours} Hours` : 'Not Required'}</span>
                                </div>
                            </div>
                            <div className="details-chip">
                                <Clock className="w-5 h-5 text-cyan-600" />
                                <div className="flex flex-col">
                                    <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Reports In</span>
                                    <span className="text-sm font-black text-slate-800">{pkg.turnaroundHours} Hours</span>
                                </div>
                            </div>
                            <div className="details-chip">
                                <Shield className="w-5 h-5 text-emerald-600" />
                                <div className="flex flex-col">
                                    <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Tests Included</span>
                                    <span className="text-sm font-black text-slate-800">{pkg.totalTests} Parameters</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <aside className="package-detail-card">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[11px] font-black tracking-widest text-[#0d7c7c] uppercase">{pkg.packageTier} Series</span>
                            <span className="bg-red-50 text-red-600 text-[10px] font-black px-3 py-1 rounded-full border border-red-100">
                                SAVE {Math.round(100 - (pkg.discountedPrice / pkg.totalPrice) * 100)}%
                            </span>
                        </div>
                        <div className="flex items-end gap-2 mb-5">
                            <span className="text-[44px] leading-none font-black text-[#0f1f47]">₹{formatPrice(pkg.discountedPrice)}</span>
                            <span className="text-base text-slate-400 line-through mb-1">₹{formatPrice(pkg.totalPrice)}</span>
                        </div>
                        <div className="space-y-3 mb-6">
                            {(pkg.features?.length ? pkg.features.slice(0, 3) : ['Home Sample Collection', 'Smart Report via App', 'NABL Accredited LAB']).map((feat: string, idx: number) => (
                                <div key={idx} className="flex items-center gap-3 text-[15px] text-[#334a68] font-medium">
                                    <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 inline-flex items-center justify-center">
                                        <Check size={14} strokeWidth={3} />
                                    </span>
                                    <span>{feat}</span>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => {
                                if (!inCart) addPackage(pkg.id, pkg.packageName, pkg.discountedPrice);
                                setIsCartOpen(true);
                            }}
                            className={`w-full h-12 rounded-[16px] text-base tracking-wider font-black uppercase transition-colors ${inCart ? 'bg-slate-800 text-white' : 'bg-[#0d7c7c] text-white hover:bg-[#0b6868]'
                                }`}
                        >
                            {inCart ? 'View In Cart' : 'Book Now'}
                        </button>
                    </aside>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 max-w-[1080px] mx-auto w-full px-3 md:px-4 py-5 pb-10">
                {/* Tabs */}
                <div className="flex gap-1.5 border-b border-slate-200 mb-5 overflow-x-auto no-scrollbar">
                    {['tests', 'preparation'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest transition-colors whitespace-nowrap border-b-2 ${activeTab === tab ? 'border-[#0D7C7C] text-[#0D7C7C]' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                                }`}
                        >
                            {tab === 'tests' ? `Tests Included (${pkg.totalTests})` : 'Preparation & Info'}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="max-w-4xl package-detail-flat">
                    {activeTab === 'tests' && (
                        <div className="space-y-3">
                            <p className="text-xs font-medium text-slate-500 mb-3">This package consists of {pkg.totalTests} individual test parameters. They are organized logically to cover all major functional profiles.</p>

                            {/* Because we seeded as simple strings, we will artificially group them or show them in list */}
                            <div className="package-detail-content-card text-left overflow-hidden">
                                <button
                                    onClick={() => setExpandedTestGroup('groupA')}
                                    className="w-full flex items-center justify-between p-3 bg-transparent border-b border-slate-200"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white text-[#0D7C7C] border border-slate-200 rounded-xl"><Activity size={16} /></div>
                                        <div className="text-left">
                                            <h3 className="text-sm font-black text-slate-800">Complete Profile</h3>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{pkg.includedTestNames?.length || 0} Primary Tests</span>
                                        </div>
                                    </div>
                                    {expandedTestGroup === 'groupA' ? <Minus size={16} className="text-slate-400" /> : <Plus size={16} className="text-slate-400" />}
                                </button>
                                <AnimatePresence>
                                    {expandedTestGroup === 'groupA' && (
                                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                                            <div className="p-3 pt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {pkg.includedTestNames?.map((testName: string, idx: number) => (
                                                    <div key={idx} className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-[#0D7C7C]" />
                                                        <span className="text-xs font-medium text-slate-700">{testName}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    )}

                    {activeTab === 'preparation' && (
                        <div className="package-detail-content-card text-left p-3 space-y-4">
                            <div>
                                <h3 className="text-[11px] font-black tracking-widest uppercase text-slate-400 mb-2 flex items-center gap-2"><Droplet size={12} /> Sample Requirements</h3>
                                <div className="p-2.5 bg-orange-50 border border-orange-100 rounded-lg text-orange-800 text-xs font-medium">
                                    {pkg.fastingRequired
                                        ? `Please ensure you fast for ${pkg.fastingHours} hours before providing the sample. Drinking strictly water is allowed.`
                                        : 'No strict fasting required, but we recommend avoiding heavy meals 2 hours prior.'}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-[11px] font-black tracking-widest uppercase text-slate-400 mb-2 flex items-center gap-2"><Info size={12} /> General Guidelines</h3>
                                <ul className="space-y-2">
                                    <li className="flex items-start gap-2.5"><div className="mt-1 w-1.5 h-1.5 rounded-full bg-slate-300" /> <span className="text-xs text-slate-600">Please inform the phlebotomist about any medications you are currently taking.</span></li>
                                    <li className="flex items-start gap-2.5"><div className="mt-1 w-1.5 h-1.5 rounded-full bg-slate-300" /> <span className="text-xs text-slate-600">Wear loose, comfortable clothing for easy access to your arm.</span></li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default PackageDetailPage;
