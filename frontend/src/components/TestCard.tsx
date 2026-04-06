import React, { useState, useMemo } from 'react';
import { 
  Heart, 
  Activity, 
  Droplets, 
  ShieldCheck, 
  Pill, 
  Leaf, 
  Thermometer, 
  Stethoscope, 
  Microscope,
  Baby,
  Bone,
  CheckCircle2,
  Package,
  Clock,
  LayoutGrid
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useModal } from '../context/ModalContext';
import { useCart } from '../hooks/useCart';
import { motion, AnimatePresence } from 'framer-motion';

export interface TestCardProps {
  test: {
    id: number;
    name: string;
    slug: string;
    category: string;
    price: number;
    originalPrice: number;
    shortDesc: string;
    sampleType: string;
    fastingRequired: number;
    turnaroundTime: string;
    rating: number;
    averageRating?: number;
    isPackage?: boolean;
    testsIncluded?: number;
    recommendedFor?: string;
  };
  onViewDetails: (slug: string) => void;
  onAddToCart?: (testId: number) => Promise<void>;
  onBook: (testId: number) => void;
}

/**
 * Maps categories to Lucide icons
 */
const getCategoryIcon = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes('heart') || cat.includes('cardiac')) return <Heart className="w-5 h-5" />;
  if (cat.includes('diabetes') || cat.includes('sugar') || cat.includes('infection')) return <Activity className="w-5 h-5" />;
  if (cat.includes('liver') || cat.includes('kidney') || cat.includes('lipid')) return <Droplets className="w-5 h-5" />;
  if (cat.includes('immunity') || cat.includes('allergy')) return <ShieldCheck className="w-5 h-5" />;
  if (cat.includes('vitamin') || cat.includes('hormone')) return <Pill className="w-5 h-5" />;
  if (cat.includes('women')) return <Baby className="w-5 h-5" />;
  if (cat.includes('bone') || cat.includes('joint') || cat.includes('arthritis')) return <Bone className="w-5 h-5" />;
  if (cat.includes('fever')) return <Thermometer className="w-5 h-5" />;
  if (cat.includes('full body') || cat.includes('package')) return <LayoutGrid className="w-5 h-5" />;
  if (cat.includes('cancer')) return <Microscope className="w-5 h-5" />;
  return <Stethoscope className="w-5 h-5" />;
};

export const TestCardSkeleton = () => {
    return (
        <div className="relative p-4 bg-white rounded-2xl border border-gray-100 shadow-xs animate-pulse min-h-[220px] flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start mb-3">
                    <div className="w-9 h-9 bg-gray-200 rounded-full"></div>
                    <div className="w-16 h-5 bg-gray-200 rounded-full"></div>
                </div>
                <div className="w-3/4 h-5 bg-gray-200 rounded mb-2"></div>
                <div className="w-1/2 h-4 bg-gray-200 rounded mb-3"></div>
            </div>
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <div className="w-16 h-4 bg-gray-200 rounded"></div>
                    <div className="w-20 h-6 bg-gray-200 rounded"></div>
                </div>
                <div className="w-24 h-9 bg-gray-200 rounded-lg"></div>
            </div>
        </div>
    );
};

export const TestCard: React.FC<TestCardProps> = ({
  test,
  onViewDetails,
  onBook
}) => {
  const { isAuthenticated } = useAuth();
  const { openAuthModal } = useModal();
  const { cart, updateQuantity, addTest, removeItem } = useCart();
  
  const [isUpdating, setIsUpdating] = useState(false);

  // Magic Pricing: Ensure a discount is always shown
  const pricing = useMemo(() => {
    let price = test.price;
    let original = test.originalPrice || test.price;
    
    // If price is 0 (shouldn't happen with real data), set a fallback
    if (price <= 0) price = 499; 
    
    // If no real discount, create a 20-30% hike
    if (original <= price) {
        original = Math.floor(price * 1.28);
    }
    
    const discount = Math.round(((original - price) / original) * 100);
    return { price, original, discount };
  }, [test.price, test.originalPrice]);

  const cartItem = useMemo(() => {
     if (!cart || !cart.items) return null;
     return cart.items.find(item => item.testId === test.id);
  }, [cart, test.id]);

  const quantity = cartItem?.quantity || 0;

  const handleIncrement = async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isAuthenticated) {
          openAuthModal('login');
          return;
      }
      if (isUpdating) return;
      setIsUpdating(true);
      try {
          if (quantity === 0) {
              await addTest(test.id, test.name, pricing.price, 1);
          } else {
              await updateQuantity(cartItem!.cartItemId, quantity + 1);
          }
      } catch (err) {
          console.error('[TestCard] Error adding to cart:', err);
      } finally {
          setIsUpdating(false);
      }
  };

  const handleDecrement = async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!cartItem || isUpdating) return;
      setIsUpdating(true);
      try {
          if (quantity === 1) {
              await removeItem(cartItem.cartItemId);
          } else {
              await updateQuantity(cartItem.cartItemId, quantity - 1);
          }
      } catch (err) {
          console.error('[TestCard] Error removing from cart:', err);
      } finally {
          setIsUpdating(false);
      }
  };

  return (
    <div 
        className="relative group p-3.5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 flex flex-col cursor-pointer overflow-hidden isolate min-h-[200px]"
        onClick={() => onViewDetails(test.slug)}
    >
        {/* Top Header: Icon + Badge */}
        <div className="flex justify-between items-start mb-2.5">
            <div className="w-9 h-9 bg-teal-50 rounded-lg flex items-center justify-center text-teal-600 shrink-0 border border-teal-100/50 shadow-sm">
                {getCategoryIcon(test.category)}
            </div>
            
            {test.isPackage ? (
                <div className="flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 text-[9px] font-black uppercase tracking-wider rounded-md border border-indigo-100">
                    <Package className="w-2.5 h-2.5" /> Package
                </div>
            ) : (
                <div className="flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-700 text-[9px] font-black uppercase tracking-wider rounded-md border border-orange-100">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Lab Test
                </div>
            )}
        </div>

        {/* Info Section */}
        <div className="flex-1">
            <h3 className="text-sm font-black text-slate-800 leading-tight mb-1 line-clamp-2 min-h-[2.4rem] group-hover:text-teal-700 transition-colors">
                {test.name}
            </h3>

            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 mb-1">
                <span className="flex items-center gap-1">
                    <LayoutGrid className="w-2.5 h-2.5" />
                    {test.testsIncluded || 1} {test.testsIncluded === 1 ? 'Param' : 'Params'}
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="flex items-center gap-1 truncate max-w-[80px]">
                    {test.category || 'General'}
                </span>
            </div>
            
            <div className="flex items-center gap-1 text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                <Clock className="w-2.5 h-2.5 text-orange-500" />
                {test.turnaroundTime}
            </div>
        </div>

        {/* Price & Cart Logic */}
        <div className="mt-3.5 space-y-3">
            <div className="flex items-end justify-between">
                <div className="flex flex-col -space-y-0.5">
                    <div className="text-[11px] text-slate-400 font-bold line-through">
                        ₹{pricing.original}
                    </div>
                    <div className="text-lg font-black text-slate-900 flex items-center">
                        ₹{pricing.price}
                    </div>
                </div>
                
                <div className="px-1.5 py-0.5 bg-green-50 text-green-600 text-[10px] font-black rounded border border-green-100">
                    {pricing.discount}% OFF
                </div>
            </div>

            {/* CTA Controller */}
            <div className="h-9" onClick={e => e.stopPropagation()}>
                <AnimatePresence mode="wait">
                    {quantity > 0 ? (
                        <motion.div 
                            key="qty"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="h-full flex items-center bg-orange-600 rounded-lg text-white font-black overflow-hidden shadow-sm"
                        >
                            <button 
                                onClick={handleDecrement}
                                disabled={isUpdating}
                                className="w-8 h-full flex items-center justify-center hover:bg-black/10 transition-colors disabled:opacity-50 text-lg"
                            >
                                -
                            </button>
                            <span className="flex-1 text-center text-xs">{quantity}</span>
                            <button 
                                onClick={handleIncrement}
                                disabled={isUpdating}
                                className="w-8 h-full flex items-center justify-center hover:bg-black/10 transition-colors disabled:opacity-50 text-lg"
                            >
                                +
                            </button>
                        </motion.div>
                    ) : (
                        <motion.button 
                            key="add"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleIncrement}
                            disabled={isUpdating}
                            className="w-full h-full bg-teal-700 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm hover:bg-teal-800 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
                        >
                            {isUpdating ? '...' : (
                                <>
                                    <span className="text-base font-normal">+</span> ADD TO CART
                                </>
                            )}
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>
        </div>
    </div>
  );
};
