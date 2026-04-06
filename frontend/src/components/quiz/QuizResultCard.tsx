import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Award, Share2, Clipboard, ShoppingCart } from 'lucide-react';
import type { QuizResult } from '../../services/quizService';

interface QuizResultCardProps {
    result: QuizResult;
    onViewDetails?: (result: QuizResult) => void;
}

const QuizResultCard: React.FC<QuizResultCardProps> = ({ result, onViewDetails }) => {
    const dateStr = new Date(result.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ y: -4 }}
            className="group bg-white/60 backdrop-blur-xl border border-primary/5 rounded-[2rem] p-6 shadow-radical-sm hover:shadow-radical transition-all duration-500 overflow-hidden relative"
        >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full translate-x-12 -translate-y-12 transition-colors duration-500 group-hover:bg-primary/10`} />

            <div className="relative z-10 space-y-6">
                {/* Header: Date & Score */}
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-muted-gray opacity-60">
                            <Calendar className="w-3 h-3" />
                            <span className="text-[8px] font-black uppercase tracking-widest">{dateStr}</span>
                        </div>
                        <h4 className="text-xl font-black text-evergreen uppercase tracking-tighter italic">Vitality <span className="text-primary">Snapshot</span></h4>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-black text-primary italic leading-none">{result.vitalityScore}%</div>
                        <span className="text-[8px] font-bold text-muted-gray uppercase tracking-widest opacity-40">Efficiency</span>
                    </div>
                </div>

                {/* Recommendations Summary */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Award className="w-3.5 h-3.5 text-secondary" />
                        <span className="text-[9px] font-black text-evergreen uppercase tracking-widest mt-0.5">Primary Protocols</span>
                    </div>
                    <div className="space-y-2">
                        {result.recommendations.slice(0, 2).map((recomm, i) => (
                            <div key={i} className="flex flex-col gap-0.5 pl-5 border-l border-primary/10">
                                <span className="text-[10px] font-bold text-muted-gray uppercase tracking-wider line-clamp-1">{recomm.title}</span>
                                <span className="text-[8px] text-muted-gray/60 italic font-medium">{recomm.category} optimization</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                    <button
                        onClick={() => onViewDetails?.(result)}
                        className="flex-1 py-3 bg-white border border-primary/10 text-primary rounded-xl text-[9px] font-black uppercase tracking-widest hover:border-primary/30 transition-all shadow-medical active:scale-95 flex items-center justify-center gap-2 cursor-pointer group/btn"
                    >
                        <Clipboard className="w-3 h-3 transition-transform group-hover/btn:-rotate-12" />
                        DETAILS
                    </button>
                    <button className="w-11 h-11 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-evergreen transition-all shadow-medical active:scale-95 cursor-pointer group/share">
                        <Share2 className="w-4 h-4 transition-transform group-hover/share:scale-110" />
                    </button>
                    <button className="w-11 h-11 bg-secondary text-white rounded-xl flex items-center justify-center hover:brightness-110 transition-all shadow-medical active:scale-95 cursor-pointer group/cart">
                        <ShoppingCart className="w-4 h-4 transition-transform group-hover/cart:rotate-12" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default QuizResultCard;
