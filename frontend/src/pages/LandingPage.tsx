import React, { Suspense, lazy, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaMapMarkerAlt, FaLocationArrow, FaPhoneAlt, FaClipboardCheck, FaWhatsapp, FaUserAlt, FaRadiation, FaTint, FaSyringe, FaPills } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useModal } from '../context/ModalContext';
import toast from 'react-hot-toast';

// Lazy load UI components
const TestCarousel = lazy(() => import('../components/ui/TestCarousel'));
const HeroBannerCarousel = lazy(() => import('../components/ui/HeroBannerCarousel'));
const PulseSupport = lazy(() => import('../components/ui/PulseSupport'));
const ExpertsSection = lazy(() => import('../components/doctor/ExpertsSection'));
const FloatingElement = lazy(() => import('../components/common/FloatingElement'));
const CategoryBar = lazy(() => import('../components/ui/CategoryBar'));
const DiagnosticProtocol = lazy(() => import('../components/ui/DiagnosticProtocol'));
const UserDashboard = lazy(() => import('../components/dashboard/UserDashboard'));
const HomeCollectionProcess = lazy(() => import('../components/ui/HomeCollectionProcess'));
const PromotionalOffersWidget = lazy(() => import('../components/dashboard/PromotionalOffersWidget'));
const DNAHelix3D = lazy(() => import('../components/3d/DNAHelix3D'));
const MedicalIcons3D = lazy(() => import('../components/3d/MedicalIcons3D'));

// Skeleton Fallback for 3D/Heavy sections
const SkeletonFallback = () => (
    <div className="w-full h-full min-h-50 flex items-center justify-center bg-transparent">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin opacity-20" />
    </div>
);

const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated, currentUser } = useAuth();
    const { openAuthModal } = useModal();

    // Auto-redirect staff users to their dedicated dashboards
    useEffect(() => {
        if (!isAuthenticated || !currentUser?.role) return;
        const role = currentUser.role;
        if (role === 'ADMIN') navigate('/admin', { replace: true });
        else if (role === 'TECHNICIAN') navigate('/technician', { replace: true });
        else if (role === 'MEDICAL_OFFICER') navigate('/medical-officer', { replace: true });
    // PATIENT stays on landing page
    }, [isAuthenticated, currentUser, navigate]);

    // Optimize 3D Rendering: Only load/render when visible
    const [show3D, setShow3D] = useState(false);
    const ref3D = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setShow3D(true);
                    observer.disconnect(); // Once visible, keep it (or keep observing if you want to unmount on hide)
                }
            },
            { threshold: 0.1, rootMargin: '100px' } // Load slightly before it comes into view
        );
        if (ref3D.current) observer.observe(ref3D.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div className="w-full bg-[#F0F9F9] flex flex-col">
            <div className="w-full overflow-x-hidden">
                {/* HERO SECTION */}
                <section className="relative pt-6 pb-4 flex items-center overflow-hidden">
                    <div className="absolute inset-0 bg-white/40 opacity-10 blur-[80px] -z-10 animate-blob" />

                    <div className="content-wrapper relative grid grid-cols-1 items-center">

                        <div ref={ref3D} className="absolute right-[2%] top-1/2 -translate-y-1/2 hidden lg:block w-[42%] max-w-160 h-130 pointer-events-none z-0">
                            <div className="absolute inset-0 rounded-[48%] bg-linear-to-br from-cyan-200/50 via-teal-100/35 to-transparent blur-3xl opacity-70" />
                            <div className="absolute inset-0 rounded-[40%] border border-cyan-200/30 bg-white/10 backdrop-blur-[2px] shadow-[0_30px_80px_rgba(45,212,191,0.12)]" />
                            {show3D && (
                                <Suspense fallback={<SkeletonFallback />}>
                                    <DNAHelix3D className="relative h-full w-full opacity-95 scale-[0.92]" />
                                </Suspense>
                            )}
                            <div className="absolute top-10 left-8 z-20">
                                <Suspense fallback={null}>
                                    <FloatingElement duration={4}>
                                        <div className="medical-card px-4 py-2 border-primary/20 text-primary-teal font-black uppercase text-[10px] tracking-[0.2em] rotate-[-8deg] pointer-events-none shadow-lg">
                                            DNA Intelligence
                                        </div>
                                    </FloatingElement>
                                </Suspense>
                            </div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="space-y-2 lg:space-y-3 text-center lg:text-left z-10 relative max-w-lg mx-auto lg:mx-0"
                        >
                            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-primary/5 rounded-full border border-primary/10 backdrop-blur-md">
                                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-sm shadow-primary/40" />
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">Medical Intelligence OS</span>
                            </div>

                            <div className="space-y-1 lg:space-y-2 pt-1">
                                <h1 className="text-2xl md:text-3xl lg:text-[36px] font-black text-ever-green leading-tight tracking-tighter uppercase italic text-balance">
                                    YOUR HEALTH <br />
                                    <span className="text-primary">POCKET-SIZED.</span>
                                </h1>
                                <p className="text-[11px] md:text-xs lg:text-[13px] text-ever-green font-bold max-w-sm leading-snug mx-auto lg:mx-0 opacity-80">
                                    Track reports in 3D, consult doctors via AR, and manage your vitality from one radical interface.
                                </p>
                            </div>

                            {/* SEARCH BRIDGE */}
                            <div className="w-full max-w-3xl mx-auto pt-3 space-y-3">
                                {/* Search Bar (Pill Shape) */}
                                <div className="flex bg-white rounded-full p-1 border border-gray-100 shadow-md items-center relative z-20 flex-col sm:flex-row gap-1 sm:gap-0 max-w-2xl mx-auto lg:mx-0">
                                    {/* Location */}
                                    <div
                                        className="flex items-center justify-between sm:justify-start px-2 space-x-1.5 border-b sm:border-b-0 sm:border-r border-gray-200 w-full sm:w-auto h-8 cursor-pointer hover:bg-gray-50 transition-colors rounded-l-full"
                                        onClick={() => toast('Auto-location feature coming soon!', { icon: '📍' })}
                                    >
                                        <div className="flex items-center gap-1">
                                            <FaMapMarkerAlt className="text-pink-500 text-xs" />
                                            <span className="text-gray-800 font-bold text-[10px] whitespace-nowrap">New Delhi</span>
                                        </div>
                                        <FaLocationArrow className="text-red-500 cursor-pointer text-xs ml-1" />
                                    </div>
                                    {/* Search Input */}
                                    <div className="flex-1 flex items-center px-2 w-full h-8">
                                        <input
                                            type="text"
                                            placeholder="Search tests or checkups"
                                            className="w-full bg-transparent border-none outline-none text-[10px] font-medium text-gray-700 placeholder-gray-400"
                                            onKeyDown={(e) => { if (e.key === 'Enter') navigate('/lab-tests/all-lab-tests?search=' + (e.target as HTMLInputElement).value); }}
                                        />
                                    </div>
                                    {/* Red Search Button */}
                                    <button
                                        onClick={() => navigate('/lab-tests/all-lab-tests')}
                                        title="Search Tests"
                                        aria-label="Search Tests"
                                        className="w-full sm:w-8 h-8 rounded-full bg-[#ff4e4e] text-white flex items-center justify-center hover:scale-105 shadow-sm shrink-0"
                                    >
                                        <FaSearch className="text-[10px]" />
                                    </button>
                                </div>

                                {/* Quick Actions */}
                                <div className="flex flex-col sm:flex-row gap-2 justify-center lg:justify-start w-full relative z-20 max-w-2xl mx-auto lg:mx-0">
                                    <a href="tel:+918000000000" className="flex-1 flex items-center justify-center space-x-1.5 bg-[#f0f8fd] text-gray-700 py-2 rounded-lg hover:bg-[#e1f0fa] transition-colors border border-[#d6effd] cursor-pointer">
                                        <FaPhoneAlt className="text-blue-500 text-xs" />
                                        <span className="text-[10px]">Book via <span className="font-bold text-gray-900">Phone</span></span>
                                    </a>
                                    <button
                                        onClick={() => isAuthenticated ? navigate('/my-bookings') : openAuthModal('login')}
                                        className="flex-1 flex items-center justify-center space-x-1.5 bg-[#fdf2f6] text-gray-700 py-2 rounded-lg hover:bg-[#fce5ee] transition-colors border border-[#fae2ec]"
                                    >
                                        <FaClipboardCheck className="text-pink-500 text-xs" />
                                        <span className="text-[10px]">Quick <span className="font-bold text-gray-900">Order</span></span>
                                    </button>
                                    <button
                                        onClick={() => toast('Whatsapp integration coming soon!', { icon: '💬' })}
                                        className="flex-1 flex items-center justify-center space-x-1.5 bg-[#f0fcf4] text-gray-700 py-2 rounded-lg hover:bg-[#e1faea] transition-colors border border-[#dafae6]"
                                    >
                                        <FaWhatsapp className="text-green-500 text-xs" />
                                        <span className="text-[10px]">Book via <span className="font-bold text-gray-900">WA</span></span>
                                    </button>
                                </div>

                                {/* Categories Cards Grid */}
                                <div className="bg-white rounded-[1.5rem] border border-gray-100 p-3 sm:p-4 shadow-sm relative z-20 pointer-events-auto max-w-2xl mx-auto lg:mx-0">
                                    <h2 className="text-sm sm:text-base font-bold text-gray-900 mb-3 text-left">Find tests & packages for your needs</h2>

                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                                        {/* Full Body Packages */}
                                        <div
                                            onClick={() => navigate('/lab-tests-category/full-body-checkup')}
                                            className="md:col-span-5 bg-white border border-gray-100 rounded-lg p-2.5 flex items-center justify-between hover:shadow-sm transition-all cursor-pointer border-l-2 border-l-[2px] border-l-transparent hover:border-l-green-400 group"
                                        >
                                            <div>
                                                <p className="font-bold text-gray-900 text-left text-xs leading-snug">Full Body</p>
                                                <p className="font-bold text-gray-900 text-left text-xs leading-snug">Packages</p>
                                            </div>
                                            <div className="p-1.5 border border-gray-100 rounded shadow-sm bg-green-50/50 group-hover:bg-green-100/50 transition-colors">
                                                <FaUserAlt className="text-green-500 text-base" />
                                            </div>
                                        </div>

                                        {/* X Rays, Scans & More */}
                                        <div
                                            onClick={() => navigate('/lab-tests/all-lab-tests')}
                                            className="md:col-span-7 bg-white border border-gray-100 rounded-lg p-2.5 flex items-center justify-between hover:shadow-sm transition-all cursor-pointer border-l-[2px] border-l-transparent hover:border-l-blue-400 group"
                                        >
                                            <div>
                                                <p className="font-bold text-gray-900 text-left text-xs leading-snug">X Rays, Scans &</p>
                                                <p className="font-bold text-gray-900 text-left text-xs leading-snug">More</p>
                                            </div>
                                            <div className="p-1.5 border border-gray-100 rounded shadow-sm bg-blue-50/50 group-hover:bg-blue-100/50 transition-colors">
                                                <FaRadiation className="text-blue-500 text-base" />
                                            </div>
                                        </div>

                                        {/* Fever Tests */}
                                        <div
                                            onClick={() => navigate('/lab-tests-category/fever')}
                                            className="md:col-span-4 bg-white border border-gray-100 rounded-lg p-2.5 flex items-center justify-between hover:shadow-sm transition-all cursor-pointer border-l-[2px] border-l-transparent hover:border-l-blue-400 group"
                                        >
                                            <p className="font-bold text-gray-900 text-left text-[11px]">Fever Tests</p>
                                            <div className="p-1.5 border border-gray-100 rounded shadow-sm bg-blue-50/50 group-hover:bg-blue-100/50 transition-colors">
                                                <FaTint className="text-blue-500 text-sm" />
                                            </div>
                                        </div>

                                        {/* Diabetes Tests */}
                                        <div
                                            onClick={() => navigate('/lab-tests-category/diabetes')}
                                            className="md:col-span-4 bg-white border border-gray-100 rounded-lg p-2.5 flex items-center justify-between hover:shadow-sm transition-all cursor-pointer border-l-[2px] border-l-transparent hover:border-l-pink-400 group"
                                        >
                                            <div>
                                                <p className="font-bold text-gray-900 text-left text-[11px] leading-snug">Diabetes</p>
                                                <p className="font-bold text-gray-900 text-left text-[11px] leading-snug">Tests</p>
                                            </div>
                                            <div className="p-1.5 border border-gray-100 rounded shadow-sm bg-pink-50/50 group-hover:bg-pink-100/50 transition-colors">
                                                <FaSyringe className="text-pink-500 text-sm" />
                                            </div>
                                        </div>

                                        {/* Vitamins Tests */}
                                        <div
                                            onClick={() => navigate('/lab-tests-category/vitamin')}
                                            className="md:col-span-4 bg-white border border-gray-100 rounded-lg p-2.5 flex items-center justify-between hover:shadow-sm transition-all cursor-pointer border-l-[2px] border-l-transparent hover:border-l-purple-400 group"
                                        >
                                            <div>
                                                <p className="font-bold text-gray-900 text-left text-[11px] leading-snug">Vitamins</p>
                                                <p className="font-bold text-gray-900 text-left text-[11px] leading-snug">Tests</p>
                                            </div>
                                            <div className="p-1.5 border border-gray-100 rounded shadow-sm bg-purple-50/50 group-hover:bg-purple-100/50 transition-colors">
                                                <FaPills className="text-purple-500 text-sm" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </motion.div>
                    </div>
                </section>

                {/* ── Banner Carousel ── */}
                <Suspense fallback={<div className="w-full h-48 bg-slate-100 animate-pulse" />}>
                    <HeroBannerCarousel />
                </Suspense>

                <Suspense fallback={<SkeletonFallback />}>
                    <UserDashboard />
                </Suspense>

                {/* AI DIAGNOSTIC HUB PROMO */}
                <section className="py-12 bg-white">
                    <div className="content-wrapper">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div className="space-y-6">
                                <div className="inline-flex items-center space-x-2 px-3 py-1 bg-teal-50 rounded-full border border-teal-100">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary-teal">Advanced Intelligence</span>
                                </div>
                                <h2 className="text-3xl lg:text-4xl font-black text-slate-800 leading-tight uppercase italic underline decoration-teal-500/20">
                                    NOT JUST DATA. <br />
                                    <span className="text-primary-teal">VITALITY INSIGHTS.</span>
                                </h2>
                                <p className="text-sm font-bold text-slate-500 max-w-md leading-relaxed">
                                    Our proprietary AI engine processes your lab results into an easy-to-understand vitality matrix. 
                                    See your organ health, monitor trends, and take control of your wellness.
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="text-2xl font-black text-slate-800 mb-1">98%</div>
                                        <div className="text-[10px] uppercase font-bold text-slate-400">Diagnostic Clarity</div>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="text-2xl font-black text-slate-800 mb-1">Instant</div>
                                        <div className="text-[10px] uppercase font-bold text-slate-400">Smart Translation</div>
                                    </div>
                                </div>
                                <button onClick={() => navigate('/lab-tests/all-lab-tests')} className="px-8 py-3 bg-primary-teal text-white rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-teal-600/20">
                                    Explore Health Hub
                                </button>
                            </div>
                            <div className="relative">
                                <div className="absolute -inset-4 bg-teal-500/10 blur-3xl rounded-full animate-pulse" />
                                <div className="bg-slate-900 rounded-3xl p-6 shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500 border border-slate-800">
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="w-12 h-1.5 bg-slate-700 rounded-full" />
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 rounded-full bg-red-400" />
                                            <div className="w-2 h-2 rounded-full bg-yellow-400" />
                                            <div className="w-2 h-2 rounded-full bg-green-400" />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
                                            <div className="flex justify-between text-white text-[10px] font-black uppercase mb-2">
                                                <span>Liver Vitality</span>
                                                <span className="text-green-400">92/100</span>
                                            </div>
                                            <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                                                <div className="bg-green-400 h-full w-[92%]" />
                                            </div>
                                        </div>
                                        <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
                                            <div className="flex justify-between text-white text-[10px] font-black uppercase mb-2">
                                                <span>Kidney Function</span>
                                                <span className="text-yellow-400">76/100</span>
                                            </div>
                                            <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                                                <div className="bg-yellow-400 h-full w-[76%]" />
                                            </div>
                                        </div>
                                        <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
                                            <div className="flex justify-between text-white text-[10px] font-black uppercase mb-2">
                                                <span>Metabolism</span>
                                                <span className="text-red-400">42/100</span>
                                            </div>
                                            <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                                                <div className="bg-red-400 h-full w-[42%]" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-6 flex justify-center">
                                        <div className="px-4 py-2 bg-slate-700/50 rounded-full text-[9px] font-bold text-slate-400">
                                            SECURE OFFICIAL AI ANALYSIS
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <CategoryBar />

                <Suspense fallback={<SkeletonFallback />}>
                    <DiagnosticProtocol />
                </Suspense>

                <Suspense fallback={<SkeletonFallback />}>
                    <PromotionalOffersWidget
                        onPromoSelect={(code) => navigate('/cart', { state: { promoCode: code } })}
                    />
                </Suspense>

                <Suspense fallback={<SkeletonFallback />}>
                    <HomeCollectionProcess />
                </Suspense>

                <Suspense fallback={<SkeletonFallback />}>
                    <ExpertsSection />
                </Suspense>

                <section className="w-full py-4 lg:py-6 bg-white relative overflow-hidden my-3 lg:my-4 flex justify-center max-w-310 mx-4 xl:mx-auto rounded-[1.5rem] shadow-sm border border-slate-100">
                    <div className="content-wrapper w-full grid lg:grid-cols-2 gap-8 lg:gap-12 items-center px-6 lg:px-8">
                        <div className="space-y-3 relative z-10 text-center lg:text-left flex flex-col items-center lg:items-start lg:pl-12 w-full">
                            <h2 className="text-lg md:text-xl lg:text-2xl font-black leading-tight tracking-tighter uppercase italic text-balance text-slate-800">
                                TRANSFORM <br />
                                <span className="text-primary underline underline-offset-2 decoration-primary/20 italic">LAB CARE.</span>
                            </h2>
                            <p className="text-[10px] lg:text-xs font-bold text-slate-500 max-w-sm opacity-90 leading-snug">
                                Experience the future of biotechnology through our unified AR dashboard. Zero friction. Total precision.
                            </p>
                            <div className="flex flex-row flex-wrap justify-center lg:justify-start gap-2 pt-2">
                                <button className="bg-primary text-white border border-primary/20 px-4 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest shadow-sm hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all">Download OS</button>
                                <button className="bg-primary/10 text-primary border border-primary/10 backdrop-blur-sm px-4 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-primary/20 hover:scale-105 active:scale-95 transition-all">Enterprise v2</button>
                            </div>
                        </div>

                        <div className="relative flex justify-center lg:justify-end mt-4 lg:mt-0 lg:pr-12 w-full">
                            <div className="absolute -inset-6 bg-primary/20 blur-2xl rounded-full opacity-60 animate-pulse" />
                            <Suspense fallback={<SkeletonFallback />}>
                                <FloatingElement duration={8} yOffset={10}>
                                    <div className="w-40 sm:w-48 min-h-55 lg:h-60 bg-white rounded-2xl sm:rounded-[1.5rem] border border-slate-100 shadow-lg rotate-0 lg:-rotate-3 overflow-hidden relative mx-auto">
                                        <div className="absolute top-2 left-4 right-4 flex justify-between items-center h-3">
                                            <div className="w-8 h-1 bg-slate-200 rounded-full" />
                                            <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-sm" />
                                        </div>
                                        <div className="mt-8 px-4 sm:px-5">
                                            <h4 className="text-sm sm:text-base font-black text-slate-800 mb-3 uppercase tracking-tighter italic">AI REPORT <br /><span className="text-primary opacity-80">#774-X</span></h4>
                                            <div className="space-y-1.5 sm:space-y-2">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="h-5 sm:h-6 bg-slate-50 rounded-lg flex items-center px-2 border border-slate-100">
                                                        <div className="w-1/2 h-1 bg-slate-200 rounded-full" />
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-4 sm:mt-5 h-12 sm:h-16 rounded-xl bg-linear-to-br from-primary/5 to-transparent flex items-center justify-center border-2 border-dashed border-primary/20">
                                                <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 sm:border-[3px] border-primary border-t-transparent rounded-full animate-spin opacity-50" />
                                            </div>
                                        </div>
                                    </div>
                                </FloatingElement>
                            </Suspense>
                        </div>
                    </div>
                </section>

                <Suspense fallback={null}>
                    <PulseSupport />
                </Suspense>
            </div >
        </div >
    );
};

export default LandingPage;
