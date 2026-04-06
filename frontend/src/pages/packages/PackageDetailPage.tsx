import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Shield, Award, Droplet, Clock, Check, Plus, Minus, Info, Activity } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import api from '../../services/api';
import { useCart } from '../../hooks/useCart';

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
    window.scrollTo(0,0);
  }, [slug]);

  if (loading) {
     return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0D7C7C]"></div></div>;
  }

  if (!pkg) {
     return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Package not found</div>;
  }

  const inCart = isInCart(undefined, pkg.id);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />
      
      {/* Dynamic Hero Section */}
      <div className="bg-[#0D7C7C] text-white pt-12 pb-24 px-6 md:px-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        
        <div className="max-w-[1210px] mx-auto relative z-10 flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1">
                {/* Meta Breadcrumb */}
                <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase opacity-70 mb-6">
                    <span className="cursor-pointer hover:opacity-100 transition-opacity" onClick={() => navigate('/packages')}>PACKAGES</span>
                    <ChevronRight size={14} />
                    <span>{pkg.packageType}</span>
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter mb-4 leading-tight">{pkg.packageName}</h1>
                <p className="text-lg opacity-90 max-w-2xl font-medium leading-relaxed mb-8">{pkg.bestFor || pkg.description || "The definitive health package covering comprehensive bodily profiles to ensure your proactive wellbeing."}</p>
                
                <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20">
                        <Droplet className="w-5 h-5 text-red-300" />
                        <div className="flex flex-col">
                            <span className="text-[9px] uppercase tracking-widest opacity-80 font-bold">Fasting</span>
                            <span className="text-sm font-black">{pkg.fastingRequired ? `${pkg.fastingHours} hrs req.` : 'Not Required'}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20">
                        <Clock className="w-5 h-5 text-blue-300" />
                        <div className="flex flex-col">
                            <span className="text-[9px] uppercase tracking-widest opacity-80 font-bold">Reports In</span>
                            <span className="text-sm font-black">{pkg.turnaroundHours} Hours</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20">
                        <Shield className="w-5 h-5 text-emerald-300" />
                        <div className="flex flex-col">
                            <span className="text-[9px] uppercase tracking-widest opacity-80 font-bold">Tests included</span>
                            <span className="text-sm font-black">{pkg.totalTests} Parameters</span>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Sticky Pricing Card (Desktop matches Hero, floats on scroll ideally) */}
            <div className="w-full md:w-[380px] shrink-0 bg-white rounded-[2rem] p-8 shadow-2xl text-slate-900 border border-slate-100 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-2 bg-linear-to-r from-[#0D7C7C] to-teal-400" />
                
                <div className="flex justify-between items-start mb-6">
                   <div className="flex flex-col">
                       <span className="text-[11px] font-bold tracking-widest text-[#0D7C7C] uppercase mb-1">{pkg.packageTier} Series</span>
                       <div className="flex items-end gap-2">
                          <span className="text-4xl font-black tracking-tighter">₹{pkg.discountedPrice}</span>
                          <span className="text-sm text-slate-400 font-medium line-through mb-1.5">₹{pkg.totalPrice}</span>
                       </div>
                   </div>
                   <div className="bg-red-50 text-red-600 font-black text-xs px-3 py-1.5 rounded-xl border border-red-100">
                      SAVE {Math.round(100 - (pkg.discountedPrice / pkg.totalPrice) * 100)}%
                   </div>
                </div>

                <div className="space-y-3 mb-8">
                    {pkg.features?.map((feat: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-3">
                            <div className="mt-0.5 p-1 bg-teal-50 rounded-full text-[#0D7C7C]"><Check size={12} strokeWidth={4} /></div>
                            <span className="text-sm font-medium text-slate-600">{feat}</span>
                        </div>
                    ))}
                    {!pkg.features && (
                        <>
                           <div className="flex items-start gap-3">
                              <div className="mt-0.5 p-1 bg-teal-50 rounded-full text-[#0D7C7C]"><Check size={12} strokeWidth={4} /></div>
                              <span className="text-sm font-medium text-slate-600">Free Home Sample Collection</span>
                           </div>
                           <div className="flex items-start gap-3">
                              <div className="mt-0.5 p-1 bg-teal-50 rounded-full text-[#0D7C7C]"><Check size={12} strokeWidth={4} /></div>
                              <span className="text-sm font-medium text-slate-600">Free Doctor Consultation</span>
                           </div>
                        </>
                    )}
                </div>

                <button 
                  onClick={() => {
                     if(!inCart) addPackage(pkg.id, pkg.packageName, pkg.discountedPrice);
                     setIsCartOpen(true);
                  }}
                  className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-sm tracking-widest uppercase transition-all shadow-lg active:scale-95 ${
                      inCart 
                      ? 'bg-slate-800 text-white shadow-slate-800/20'
                      : 'bg-[#0D7C7C] text-white hover:bg-[#084747] shadow-[#0D7C7C]/30 hover:shadow-xl hover:-translate-y-1'
                  }`}
                >
                   {inCart ? 'View In Cart' : 'Book Now'}
                </button>
            </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1210px] mx-auto w-full px-4 md:px-6 py-12 pb-32">
         {/* Tabs */}
         <div className="flex gap-2 border-b border-slate-200 mb-8 overflow-x-auto no-scrollbar">
            {['tests', 'preparation'].map((tab) => (
                <button 
                   key={tab}
                   onClick={() => setActiveTab(tab as any)}
                   className={`px-6 py-4 text-xs font-bold uppercase tracking-widest transition-colors whitespace-nowrap border-b-2 ${
                       activeTab === tab ? 'border-[#0D7C7C] text-[#0D7C7C]' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                   }`}
                >
                   {tab === 'tests' ? `Tests Included (${pkg.totalTests})` : 'Preparation & Info'}
                </button>
            ))}
         </div>

         {/* Tab Content */}
         <div className="max-w-4xl">
             {activeTab === 'tests' && (
                 <div className="space-y-4">
                     <p className="text-sm font-medium text-slate-500 mb-6">This package consists of {pkg.totalTests} individual test parameters. They are organized logically to cover all major functional profiles.</p>
                     
                     {/* Because we seeded as simple strings, we will artificially group them or show them in list */}
                     <div className="bg-white border text-left border-gray-200 rounded-[2rem] overflow-hidden shadow-sm">
                         <button 
                             onClick={() => setExpandedTestGroup('groupA')}
                             className="w-full flex items-center justify-between p-6 bg-slate-50"
                         >
                             <div className="flex items-center gap-4">
                                 <div className="p-3 bg-white text-[#0D7C7C] shadow-sm rounded-2xl"><Activity size={24} /></div>
                                 <div className="text-left">
                                     <h3 className="text-base font-black text-slate-800">Complete Profile</h3>
                                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{pkg.includedTestNames?.length || 0} Primary Tests</span>
                                 </div>
                             </div>
                             {expandedTestGroup === 'groupA' ? <Minus size={20} className="text-slate-400"/> : <Plus size={20} className="text-slate-400"/>}
                         </button>
                         <AnimatePresence>
                             {expandedTestGroup === 'groupA' && (
                                 <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                                    <div className="p-6 pt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                       {pkg.includedTestNames?.map((testName: string, idx: number) => (
                                           <div key={idx} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                                              <div className="w-1.5 h-1.5 rounded-full bg-[#0D7C7C]" />
                                              <span className="text-sm font-medium text-slate-700">{testName}</span>
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
                 <div className="bg-white border text-left border-gray-200 rounded-[2rem] p-8 shadow-sm space-y-8">
                    <div>
                        <h3 className="text-xs font-black tracking-widest uppercase text-slate-400 mb-4 flex items-center gap-2"><Droplet size={14} /> Sample Requirements</h3>
                        <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl text-orange-800 text-sm font-medium">
                            {pkg.fastingRequired 
                                ? `Please ensure you fast for ${pkg.fastingHours} hours before providing the sample. Drinking strictly water is allowed.` 
                                : 'No strict fasting required, but we recommend avoiding heavy meals 2 hours prior.'}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xs font-black tracking-widest uppercase text-slate-400 mb-4 flex items-center gap-2"><Info size={14} /> General Guidelines</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3"><div className="mt-1 w-1.5 h-1.5 rounded-full bg-slate-300"/> <span className="text-sm text-slate-600">Please inform the phlebotomist about any medications you are currently taking.</span></li>
                            <li className="flex items-start gap-3"><div className="mt-1 w-1.5 h-1.5 rounded-full bg-slate-300"/> <span className="text-sm text-slate-600">Wear loose, comfortable clothing for easy access to your arm.</span></li>
                        </ul>
                    </div>
                 </div>
             )}
         </div>
      </main>
      <Footer />
    </div>
  );
};

export default PackageDetailPage;
