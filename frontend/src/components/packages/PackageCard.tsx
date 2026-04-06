import React from 'react';
import { motion } from 'framer-motion';
import { FaFlask, FaTag, FaChevronRight, FaPercentage } from 'react-icons/fa';
import type { TestPackageResponse } from '../../services/packageService';

interface PackageCardProps {
    pkg: TestPackageResponse;
    onViewDetails: (pkg: TestPackageResponse) => void;
    onBookNow: (pkg: TestPackageResponse) => void;
    index?: number;
}

const PackageCard: React.FC<PackageCardProps> = ({ pkg, onViewDetails, onBookNow, index = 0 }) => {
    const hasSavings = pkg.savings > 0;
    const discountPercent = Math.round(pkg.discountPercentage || 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.4 }}
            className="group relative bg-white rounded-[2rem] border-2 border-primary/5 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 overflow-hidden cursor-pointer"
            onClick={() => onViewDetails(pkg)}
        >
            {/* Savings Badge */}
            {hasSavings && (
                <div className="absolute top-6 right-6 z-10">
                    <div className="bg-secondary text-white px-4 py-2 rounded-xl flex items-center space-x-1.5 shadow-lg shadow-secondary/30">
                        <FaPercentage className="text-[10px]" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Save ₹{pkg.savings.toFixed(0)}</span>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="p-8 pb-0 space-y-5">
                <div className="flex items-start space-x-5">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                        <FaFlask className="text-xl" />
                    </div>
                    <div className="flex-grow min-w-0">
                        <h3 className="text-lg font-black text-evergreen uppercase tracking-tight italic leading-tight line-clamp-2">
                            {pkg.packageName}
                        </h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-gray opacity-40 mt-1">
                            {pkg.packageCode}
                        </p>
                    </div>
                </div>

                {/* Description */}
                <p className="text-xs text-muted-gray leading-relaxed line-clamp-2">
                    {pkg.description || 'Comprehensive health assessment package.'}
                </p>

                {/* Tests Count */}
                <div className="flex items-center space-x-3 p-3 bg-primary/[0.03] rounded-xl border border-primary/5">
                    <FaTag className="text-primary text-xs" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-evergreen">
                        {pkg.totalTests} Tests Included
                    </span>
                </div>

                {/* Test Pills (show first 4) */}
                {pkg.tests && pkg.tests.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {pkg.tests.slice(0, 4).map((test, idx) => (
                            <span
                                key={idx}
                                className="text-[9px] font-bold uppercase tracking-wider text-primary bg-primary/5 px-3 py-1.5 rounded-lg"
                            >
                                {test.name}
                            </span>
                        ))}
                        {pkg.tests.length > 4 && (
                            <span className="text-[9px] font-bold uppercase tracking-wider text-muted-gray bg-gray-50 px-3 py-1.5 rounded-lg">
                                +{pkg.tests.length - 4} more
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Price & Actions */}
            <div className="p-8 pt-6 mt-4 border-t border-primary/5">
                <div className="flex items-end justify-between mb-5">
                    <div>
                        {hasSavings && (
                            <span className="text-sm font-bold text-muted-gray line-through opacity-40">
                                ₹{pkg.price.toFixed(0)}
                            </span>
                        )}
                        <div className="flex items-baseline space-x-1">
                            <span className="text-2xl font-black text-primary">₹{pkg.discountedPrice.toFixed(0)}</span>
                            {discountPercent > 0 && (
                                <span className="text-[10px] font-black uppercase tracking-widest text-secondary">
                                    {discountPercent}% off
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={(e) => { e.stopPropagation(); onViewDetails(pkg); }}
                        className="flex-1 h-12 bg-white border-2 border-primary/10 text-evergreen rounded-xl font-black uppercase tracking-widest text-[10px] hover:border-primary/30 hover:bg-primary/[0.02] transition-all cursor-pointer"
                    >
                        Details
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onBookNow(pkg); }}
                        className="flex-1 h-12 bg-primary text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 cursor-pointer"
                    >
                        <span>Book</span>
                        <FaChevronRight className="text-white/40 text-[8px]" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default PackageCard;
