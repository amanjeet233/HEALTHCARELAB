import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Check, Clock, Home, FileBarChart2, Users } from 'lucide-react';
import { useCart } from '../../hooks/useCart';

/* ─── Data Types ────────────────────────────────────────────────── */
interface WellnessTest {
  id: number;
  name: string;
  subName?: string;
  price: number;
  originalPrice: number;
  discount: string;
  testsIncluded: number;
}

const WELLNESS_TESTS: WellnessTest[] = [
  { id: 901, name: 'HB (Haemoglobin) Test', subName: 'HB (Haemoglobin) Test', price: 219, originalPrice: 548, discount: '60% off', testsIncluded: 1 },
  { id: 902, name: 'TSH Test (Thyroid Stimulating Hormone)', subName: 'TSH Test (Thyroid Stimulating Hormone)', price: 399, originalPrice: 998, discount: '60% off', testsIncluded: 1 },
  { id: 903, name: 'LDH Test (Lactate Dehydrogenase)', subName: 'LDH Test (Lactate Dehydrogenase)', price: 479, originalPrice: 1198, discount: '60% off', testsIncluded: 1 },
  { id: 904, name: 'HbA1c Test (Hemoglobin A1c)', subName: 'HbA1c Test (Hemoglobin A1c)', price: 659, originalPrice: 1647, discount: '60% off', testsIncluded: 3 },
  { id: 905, name: 'Blood Group Test', subName: 'Blood Group Test', price: 259, originalPrice: 647, discount: '60% off', testsIncluded: 9 },
  { id: 906, name: 'Beta HCG Test', subName: 'Beta HCG Test', price: 1129, originalPrice: 2823, discount: '60% off', testsIncluded: 1 },
];

/* ─── Compact Test Card ─────────────────────────────────────────── */
const CompactTestCard: React.FC<{ test: WellnessTest }> = ({ test }) => {
  const { addTest, isInCart } = useCart();
  const inCart = isInCart(test.id);

  return (
    <div className="shrink-0 w-[180px] bg-white rounded-xl border border-slate-100 p-3 flex flex-col gap-2 hover:shadow-md transition-all">
      <h4 className="text-[12px] font-black text-slate-800 leading-tight line-clamp-2 min-h-[32px]">
        {test.name}
      </h4>
      <p className="text-[10px] text-slate-400 font-medium">
        {test.testsIncluded} Test{test.testsIncluded > 1 ? 's' : ''} Included
      </p>
      
      <div className="mt-auto">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[15px] font-black text-emerald-700">₹{test.price}</span>
          <span className="text-[10px] text-slate-400 line-through">₹{test.originalPrice}</span>
        </div>
        <div className="text-[10px] font-bold text-green-600">{test.discount}</div>
      </div>

      <button
        onClick={() => !inCart && addTest(test.id, test.name, test.price)}
        className="w-full py-1.5 mt-1 rounded-lg text-[11px] font-black uppercase tracking-wider text-white transition-all active:scale-95"
        style={{ background: inCart ? '#10B981' : '#C2410C' }}
      >
        {inCart ? 'Added ✓' : 'Add'}
      </button>
    </div>
  );
};

/* ─── Special Package Card (MedSync Style) ───────────────────────── */
const PremiumWellnessPackage: React.FC = () => {
  const navigate = useNavigate();
  const { addPackage, isInCart } = useCart();
  const pkgId = 910;
  const pkgName = 'MedSync Hairfall Check Advance Female';
  const pkgPrice = 6249;
  const inCart = isInCart(undefined, pkgId);

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row">
      {/* Header / Brand area */}
      <div 
        className="md:w-1/3 p-6 flex flex-col gap-3 text-white"
        style={{ background: 'linear-gradient(135deg, #831843 0%, #EC4899 100%)' }}
      >
        <div className="flex items-center gap-2">
           <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-black tracking-widest uppercase text-white">
             VALUE FOR MONEY
           </span>
        </div>
        <h3 className="text-xl font-black leading-tight">{pkgName}</h3>
        <p className="text-sm font-bold opacity-90">60 Tests Included</p>
        <div className="mt-auto pt-4 flex items-center gap-2">
           <Clock className="w-4 h-4" />
           <span className="text-xs font-semibold">Reports in 24-48 Hours</span>
        </div>
      </div>

      {/* Content area */}
      <div className="md:w-2/3 p-6 flex flex-col gap-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 gap-x-4">
          {[
            'GLUCOSE', 'IRON', 'VITAMIN B12', 'FERRITIN', 'DHEAS', 'HBA1C', 
            'INSULIN', 'VITAMIN D', 'TESTOSTERONE', '17-OHP', 'FSH', 'LH',
            'PROLACTIN', 'CBC', 'THYROID PROFILE', 'LIPID PROFILE'
          ].slice(0, 12).map(t => (
            <div key={t} className="flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-pink-400 shrink-0" />
               <span className="text-[10px] font-bold text-slate-600 truncate">{t}</span>
            </div>
          ))}
          <div className="text-[10px] font-bold text-pink-500 italic">+ 48 more markers</div>
        </div>

        <div className="h-px bg-slate-100 my-1" />

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-800">₹{pkgPrice}</span>
              <span className="text-sm text-slate-400 line-through">₹15622</span>
            </div>
            <span className="text-sm font-bold text-green-600">60% off</span>
          </div>
          
          <div className="flex gap-3">
             <button 
               onClick={() => navigate('/test-listing/women-wellness')}
               className="px-6 py-2.5 rounded-xl border-2 border-pink-100 text-pink-600 text-xs font-black uppercase tracking-wider hover:bg-pink-50 transition-all"
             >
               View Details
             </button>
             <button 
               onClick={() => !inCart && addPackage(pkgId, pkgName, pkgPrice)}
               className="px-8 py-2.5 rounded-xl text-white text-xs font-black uppercase tracking-wider transition-all active:scale-95 shadow-md"
               style={{ background: inCart ? '#10B981' : '#EA580C' }}
             >
               {inCart ? 'Added ✓' : 'Add to Cart'}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Section ──────────────────────────────────────────────── */
const WomenWellnessSpecifics: React.FC = () => {
  return (
    <div className="w-full flex flex-col gap-6 py-4">
      
      {/* Individual Tests Row */}
      <div>
        <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
           <div className="h-px bg-slate-200 flex-1" />
           Women Wellness Tests (11)
           <div className="h-px bg-slate-200 flex-1" />
        </h3>
        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
          {WELLNESS_TESTS.map(test => (
            <CompactTestCard key={test.id} test={test} />
          ))}
          <button className="shrink-0 w-24 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-pink-500 transition-colors">
             <div className="w-10 h-10 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center">
                <Plus className="w-5 h-5" />
             </div>
             <span className="text-[10px] font-bold">Show more</span>
          </button>
        </div>
      </div>

      {/* Package Card */}
      <div>
        <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
           <div className="h-px bg-slate-200 flex-1" />
           Women Wellness Packages (1)
           <div className="h-px bg-slate-200 flex-1" />
        </h3>
        <PremiumWellnessPackage />
      </div>

    </div>
  );
};

export default WomenWellnessSpecifics;
