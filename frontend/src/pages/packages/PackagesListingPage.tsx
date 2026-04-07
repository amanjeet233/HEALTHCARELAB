import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { Shield, Sparkles, Diamond, Medal, Activity, Check, Heart, User, Users, Baby, ChevronRight } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import api from '../../services/api';
import { useCart } from '../../hooks/useCart';
import { MedSyncTestCardSkeleton } from '../../components/ui/MedSyncTestCard';

// Enums matching backend
const PackageType = {
    MEN: "MEN", WOMEN: "WOMEN", COUPLE: "COUPLE", 
    CHILD: "CHILD", SENIOR_MEN: "SENIOR_MEN", 
    SENIOR_WOMEN: "SENIOR_WOMEN", VITAMINS: "VITAMINS"
} as const;

const PackageTier = {
    SILVER: "SILVER", GOLD: "GOLD", PLATINUM: "PLATINUM", ADVANCED: "ADVANCED"
} as const;

const CATEGORIES = [
  { id: 'ALL', label: 'All Packages', icon: Activity },
  { id: PackageType.MEN, label: "Men's Health", icon: User },
  { id: PackageType.WOMEN, label: "Women's Health", icon: Heart },
  { id: PackageType.COUPLE, label: 'Couple', icon: Users },
  { id: PackageType.CHILD, label: 'Child', icon: Baby },
  { id: PackageType.SENIOR_MEN, label: 'Senior Men', icon: User },
  { id: PackageType.SENIOR_WOMEN, label: 'Senior Women', icon: Heart },
  { id: PackageType.VITAMINS, label: 'Vitamins', icon: Sparkles }
];

const TIERS = [
  { id: 'ALL', label: 'All Tiers', icon: Activity, color: 'text-slate-600', bg: 'bg-slate-100' },
  { id: PackageTier.SILVER, label: 'Silver', icon: Medal, color: 'text-slate-500', bg: 'bg-slate-100' },
  { id: PackageTier.GOLD, label: 'Gold', icon: Medal, color: 'text-amber-500', bg: 'bg-amber-100' },
  { id: PackageTier.PLATINUM, label: 'Platinum', icon: Diamond, color: 'text-blue-500', bg: 'bg-blue-100' },
  { id: PackageTier.ADVANCED, label: 'Advanced', icon: Shield, color: 'text-purple-500', bg: 'bg-purple-100' }
];

const PackagesListingPage: React.FC = () => {
  const { pathTier, pathCategory } = useParams<{ pathTier?: string; pathCategory?: string }>();
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Set initial state from path or 'ALL'
  const [activeCategory, setActiveCategory] = useState<string>(
      pathCategory ? CATEGORIES.find(c => c.id.toString().toLowerCase() === pathCategory.toLowerCase())?.id || 'ALL' : 'ALL'
  );
  
  const [activeTier, setActiveTier] = useState<string>(
      pathTier ? TIERS.find(t => t.id.toString().toLowerCase() === pathTier.toLowerCase())?.id || 'ALL' : 'ALL'
  );
  
  const navigate = useNavigate();
  const { addPackage, isInCart } = useCart();

  useEffect(() => {
    fetchPackages();
    window.scrollTo(0,0);
  }, [activeCategory, activeTier]);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      let url = '/api/test-packages';
      // Use advanced filtering if category or tier selected
      if (activeCategory !== 'ALL' || activeTier !== 'ALL') {
          url = '/api/test-packages/filter?';
          if (activeCategory !== 'ALL') url += `type=${activeCategory}&`;
          if (activeTier !== 'ALL') url += `tier=${activeTier}&`;
          url += 'size=50'; // fetch more for catalogue
          const res = await api.get(url);
          setPackages(res.data?.data?.content || []);
      } else {
          const res = await api.get(url);
          setPackages(res.data?.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch packages:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent font-sans flex flex-col">
      <Header />
      
      {/* Hero Banner */}
      <div className="bg-[#0D7C7C] text-white pt-16 pb-24 px-6 md:px-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="max-w-[1210px] mx-auto relative z-10 flex flex-col items-center text-center">
            <span className="px-4 py-1.5 rounded-full bg-white/20 text-[10px] font-bold tracking-[0.2em] uppercase mb-6 backdrop-blur-md border border-white/30">
              Complete Health Coverage
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter mb-4 leading-tight">
               Precision Diagnostics.<br/>Packaged for You.
            </h1>
            <p className="opacity-90 max-w-2xl text-sm md:text-base font-medium leading-relaxed">
               Discover 130+ meticulously designed diagnostic packages starting from Silver basics to Advanced MRI screenings.
            </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-[1210px] mx-auto w-full px-4 md:px-6 -mt-12 relative z-20 pb-20">
         
         {/* Filters Card */}
         <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-6 md:p-8 mb-10 border border-slate-100">
             
             {/* Category Filter */}
             <div className="mb-8">
                 <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4">Who is this for?</h3>
                 <div className="flex flex-wrap gap-2.5">
                     {CATEGORIES.map(cat => {
                        const Icon = cat.icon;
                        const isActive = activeCategory === cat.id;
                        return (
                            <button
                              key={cat.id}
                              onClick={() => {
                                  setActiveCategory(cat.id);
                                  // Optional: reflect in URL
                                  navigate(cat.id === 'ALL' ? '/packages' : `/packages/category/${cat.id.toLowerCase()}`, { replace: true });
                              }}
                              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-wider transition-all duration-300 ${
                                  isActive 
                                  ? 'bg-[#0D7C7C] text-white shadow-xl shadow-[#0D7C7C]/30 scale-105' 
                                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100'
                              }`}
                            >
                               <Icon size={16} strokeWidth={2.5} />
                               {cat.label}
                            </button>
                        );
                     })}
                 </div>
             </div>

             {/* Tier Filter */}
             <div>
                 <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4">Select Series Level</h3>
                 <div className="flex flex-wrap gap-3">
                     {TIERS.map(tier => {
                        const Icon = tier.icon;
                        const isActive = activeTier === tier.id;
                        return (
                            <button
                              key={tier.id}
                              onClick={() => {
                                  setActiveTier(tier.id);
                                  // Optional: reflect in URL
                                  navigate(tier.id === 'ALL' ? '/packages' : `/packages/tier/${tier.id.toLowerCase()}`, { replace: true });
                              }}
                              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-wider transition-all duration-300 border ${
                                  isActive 
                                  ? `border-${tier.color.split('-')[1]}-500 ${tier.bg} ${tier.color} shadow-lg scale-[1.02]` 
                                  : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                              }`}
                            >
                               <Icon size={16} strokeWidth={2.5} className={isActive ? '' : tier.color} />
                               {tier.label} Series
                               {isActive && <Check size={14} className="ml-1" strokeWidth={3}/>}
                            </button>
                        );
                     })}
                 </div>
             </div>
         </div>

         {/* Results Grid */}         {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {[1,2,3,4,5,6].map(i => (
                     <MedSyncTestCardSkeleton key={i} />
                 ))}
             </div>
         ) : packages.length === 0 ? (
             <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
                 <Shield className="w-16 h-16 text-slate-200 mx-auto mb-4" strokeWidth={1} />
                 <h3 className="text-lg font-bold text-slate-800">No Packages Found</h3>
                 <p className="text-slate-500 text-sm mt-2">Try adjusting your filters to see more results.</p>
                 <button onClick={() => { setActiveCategory('ALL'); setActiveTier('ALL'); }} className="mt-6 text-[#0D7C7C] font-bold text-sm tracking-widest uppercase hover:underline">Clear Filters</button>
             </div>
         ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <AnimatePresence>
                    {packages.map((pkg, idx) => {
                       const inCart = isInCart(undefined, pkg.id);
                       return (
                           <motion.div
                             key={pkg.id}
                             initial={{ opacity: 0, y: 30 }}
                             animate={{ opacity: 1, y: 0 }}
                             transition={{ delay: idx * 0.05 }}
                             className="bg-white rounded-[2rem] p-6 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-slate-100 flex flex-col group cursor-pointer relative overflow-hidden"
                             onClick={() => navigate(`/packages/${pkg.packageCode}`)}
                           >
                              {/* Top Tag */}
                              <div className="flex justify-between items-start mb-4">
                                  <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase ${
                                     pkg.packageTier === 'ADVANCED' ? 'bg-purple-100 text-purple-700' :
                                     pkg.packageTier === 'PLATINUM' ? 'bg-blue-100 text-blue-700' :
                                     pkg.packageTier === 'GOLD' ? 'bg-amber-100 text-amber-700' :
                                     'bg-slate-100 text-slate-700'
                                  }`}>
                                     {pkg.packageTier} SERIES
                                  </span>
                                  {pkg.isPopular && (
                                     <span className="flex items-center gap-1 text-[9px] font-bold tracking-widest uppercase text-red-500 bg-red-50 px-2 py-1 rounded-full">
                                         <Heart fill="currentColor" size={10} /> Popular
                                     </span>
                                  )}
                              </div>

                              {/* Title */}
                              <h2 className="text-xl font-black text-slate-800 leading-tight mb-2 group-hover:text-[#0D7C7C] transition-colors">{pkg.packageName}</h2>
                              <p className="text-xs text-slate-500 font-medium mb-6 line-clamp-2">{pkg.bestFor || pkg.description || "Comprehensive health checkup designed for your wellbeing."}</p>

                              {/* Metrics */}
                              <div className="flex items-center gap-4 mb-6">
                                  <div className="flex flex-col">
                                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Total Tests</span>
                                      <span className="text-sm font-black text-slate-800">{pkg.totalTests} Parameters</span>
                                  </div>
                                  <div className="w-px h-8 bg-slate-100" />
                                  <div className="flex flex-col">
                                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Reports In</span>
                                      <span className="text-sm font-black text-slate-800">{pkg.turnaroundHours} Hours</span>
                                  </div>
                              </div>
                              
                              <div className="mt-auto pt-6 border-t border-slate-50 flex items-end justify-between">
                                  <div className="flex flex-col">
                                      <span className="text-[10px] text-slate-400 font-medium line-through">₹{pkg.totalPrice}</span>
                                      <span className="text-2xl font-black text-[#0D7C7C] tracking-tight">₹{pkg.discountedPrice}</span>
                                  </div>
                                  <button
                                     onClick={(e) => {
                                        e.stopPropagation();
                                        if(!inCart) addPackage(pkg.id, pkg.packageName, pkg.discountedPrice);
                                     }}
                                     className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg ${
                                         inCart 
                                         ? 'bg-slate-800 text-white shadow-slate-800/30' 
                                         : 'bg-[#0D7C7C] text-white hover:bg-[#084747] shadow-[#0D7C7C]/30 hover:scale-105 active:scale-95'
                                     }`}
                                  >
                                      {inCart ? <Check size={20} strokeWidth={3} /> : <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" strokeWidth={3}/>}
                                  </button>
                              </div>
                           </motion.div>
                       )
                    })}
                 </AnimatePresence>
             </div>
         )}
      </main>
      <Footer />
    </div>
  );
};

export default PackagesListingPage;
