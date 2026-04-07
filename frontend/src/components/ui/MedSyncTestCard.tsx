import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Check, FlaskConical, Droplets, Heart, Brain, Activity, 
  Leaf, Bone, Shield, Zap, Baby, Wind, Clock 
} from 'lucide-react';
import { useCart } from '../../hooks/useCart';

export interface MedSyncTestCardData {
  id: number;
  name: string;
  canonicalTag?: string;
  slug?: string;
  category?: string;
  itemType?: 'TEST' | 'PACKAGE';
  isPackage?: boolean;
  parametersCount?: number;
  testsIncluded?: number;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  turnaroundTime?: string;
  reportTATMessage?: string;
  reportTAT?: string;
}

const getTestIcon = (name: string, category?: string) => {
  const n = (name + (category || '')).toLowerCase();
  if (n.includes('diabetes') || n.includes('glucose') || n.includes('sugar')) return { icon: Droplets, color: '#0EA5E9', bg: '#F0F9FF' };
  if (n.includes('heart') || n.includes('lipid') || n.includes('cholesterol') || n.includes('cardiac')) return { icon: Heart, color: '#E11D48', bg: '#FFF1F2' };
  if (n.includes('thyroid') || n.includes('tsh') || n.includes('brain')) return { icon: Brain, color: '#7C3AED', bg: '#F5F3FF' };
  if (n.includes('kidney') || n.includes('kft') || n.includes('creatinine') || n.includes('urea')) return { icon: Activity, color: '#D97706', bg: '#FFFBEB' };
  if (n.includes('liver') || n.includes('lft')) return { icon: Leaf, color: '#EA580C', bg: '#FFF7ED' };
  if (n.includes('bone') || n.includes('calcium') || n.includes('vitamin d') || n.includes('joint')) return { icon: Bone, color: '#65A30D', bg: '#F7FEE7' };
  if (n.includes('immunity') || n.includes('fever') || n.includes('cbc') || n.includes('blood')) return { icon: Shield, color: '#0369A1', bg: '#F0F9FF' };
  if (n.includes('vitamin') || n.includes('nutrition') || n.includes('vit')) return { icon: Zap, color: '#0891B2', bg: '#ECFEFF' };
  if (n.includes('baby') || n.includes('pregnancy')) return { icon: Baby, color: '#DB2777', bg: '#FDF2F8' };
  if (n.includes('lungs') || n.includes('asthma') || n.includes('allergy') || n.includes('wind')) return { icon: Wind, color: '#0D9488', bg: '#F0FDFA' };
  return { icon: FlaskConical, color: '#C2410C', bg: '#FFF7ED' };
};

export const MedSyncTestCardSkeleton = () => (
  <div className="rounded-2xl border border-slate-100 bg-white p-3 space-y-3 animate-pulse h-[180px]">
    <div className="flex justify-between">
      <div className="w-8 h-8 bg-slate-50 rounded-lg" />
      <div className="w-12 h-3 bg-slate-50 rounded" />
    </div>
    <div className="h-3 bg-slate-50 rounded w-full" />
    <div className="h-3 bg-slate-50 rounded w-2/3" />
    <div className="h-8 bg-slate-50 rounded-lg mt-4" />
  </div>
);

const MedSyncTestCard: React.FC<{ item: MedSyncTestCardData }> = ({ item }) => {
  const navigate = useNavigate();
  const { addTest, isInCart } = useCart();
  const inCart = isInCart(item.id);

  const name = item.name || 'Lab Test';
  const price = item.price ?? 0;
  const original = item.originalPrice || Math.round(price * 1.3);
  const discount = item.discountPercent || Math.round(((original - price) / original) * 100);
  const params = item.parametersCount || item.testsIncluded || 1;
  const category = item.category || 'Clinical Pathology';

  const { icon: Icon, color: iconColor, bg: iconBg } = getTestIcon(name, category);

  const handleNavigate = () => {
    const slug = item.slug || item.canonicalTag || String(item.id);
    navigate(`/test/${slug}`);
  };

  return (
    <div 
      className="group relative bg-white rounded-2xl border border-slate-100 p-2.5 flex flex-col gap-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer overflow-hidden shadow-sm"
      onClick={handleNavigate}
      style={{ borderBottom: `3px solid ${iconColor}40` }}
    >
      {/* Header: Exact Circular Icon Style from Screenshot */}
      <div className="flex items-center justify-between">
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 duration-300" 
          style={{ background: `${iconColor}10` }}
        >
          {/* Inner White Circle with shadow */}
          <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md">
            <Icon className="w-4 h-4" style={{ color: iconColor }} strokeWidth={2.5} />
          </div>
        </div>
        <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-tight bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100/50">
          {item.isPackage || item.itemType === 'PACKAGE' ? 'Package' : 'Lab Test'}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 mt-0.5">
        <h3 className="text-[12.5px] font-black text-slate-800 leading-[1.25] line-clamp-2 min-h-[1.6rem] group-hover:text-teal-700 transition-colors uppercase tracking-tight">
          {name}
        </h3>
        <div className="flex flex-col gap-1 mt-1.5">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: iconColor }} />
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider truncate">{category}</p>
          </div>
          <p className="text-[9px] text-slate-400 font-medium flex items-center gap-1">
            <Activity className="w-2.5 h-2.5 text-slate-300" />
            {params} Parameter{params !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Price Block */}
      <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
        <div className="flex flex-col -space-y-0.5">
          <span className="text-[9px] text-slate-400 line-through font-bold">₹{original}</span>
          <span className="text-[15px] font-black text-slate-900 leading-none">₹{price}</span>
        </div>
        <div className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100">
          {discount}% OFF
        </div>
      </div>

      {/* Book Button */}
      <div className="flex gap-1.5 mt-0.5">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!inCart) addTest(item.id, name, price);
          }}
          className="flex-1 h-7.5 rounded-lg text-[9.5px] font-black uppercase tracking-wider text-white transition-all active:scale-95 shadow-sm flex items-center justify-center gap-1"
          style={{ background: inCart ? '#059669' : '#0F172A' }}
        >
          {inCart ? (
            <>Added ✓</>
          ) : (
            <>
              <Plus className="w-2.5 h-2.5" strokeWidth={3} />
              Book
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default MedSyncTestCard;
