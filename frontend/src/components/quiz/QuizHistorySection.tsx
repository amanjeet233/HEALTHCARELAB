import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Brain, ChevronRight, Zap, ArrowRight, ClipboardList } from 'lucide-react';
import { quizService, type QuizResult } from '../../services/quizService';
import QuizResultCard from './QuizResultCard';

const QuizHistorySection: React.FC = () => {
    const [history, setHistory] = useState<QuizResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedQuiz, setSelectedQuiz] = useState<QuizResult | null>(null);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        setIsLoading(true);
        try {
            const data = await quizService.getQuizHistory();
            setHistory(data);
        } catch (error) {
            console.error('Failed to load quiz history:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary shadow-medical">
                            <History className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Intelligence Log</span>
                    </div>
                    <h2 className="text-3xl font-black text-evergreen uppercase tracking-tighter italic leading-none">
                        Vitality <span className="text-secondary">Synthesis History</span>
                    </h2>
                </div>

                <div className="flex bg-white/40 backdrop-blur-xl border border-primary/5 rounded-2xl p-4 items-center gap-4 shadow-radical-sm text-[10px] font-black uppercase tracking-widest text-muted-gray">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>Average Vitality: <span className="text-evergreen italic">88%</span></span>
                </div>
            </div>

            {/* List vs Empty State */}
            <div className="min-h-[400px]">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                            <Brain className="w-10 h-10 text-primary opacity-20" />
                        </motion.div>
                    </div>
                ) : history.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {history.map((result) => (
                            <QuizResultCard
                                key={result.id}
                                result={result}
                                onViewDetails={setSelectedQuiz}
                            />
                        ))}

                        {/* Retake CTA Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-primary group rounded-[2rem] p-8 text-white relative overflow-hidden flex flex-col justify-between shadow-medical hover:shadow-cyan-glow transition-all cursor-pointer border border-white/10"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full translate-x-12 -translate-y-12" />
                            <div className="relative z-10 space-y-4">
                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                                    <Brain className="w-6 h-6" />
                                </div>
                                <h4 className="text-2xl font-black uppercase tracking-tighter italic leading-none">Re-Scan <br />Systems</h4>
                                <p className="text-[10px] font-medium text-white/60 uppercase tracking-widest leading-relaxed">Update your biometrics for high-fidelity calibration.</p>
                            </div>
                            <div className="relative z-10 flex items-center gap-3 pt-6 group-hover:translate-x-2 transition-transform">
                                <span className="text-[10px] font-black uppercase tracking-widest">Start Scan</span>
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </motion.div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-96 bg-primary/[0.02] border border-dashed border-primary/20 rounded-[3rem] space-y-6">
                        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-primary/20 shadow-medical">
                            <ClipboardList className="w-10 h-10" />
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-black text-evergreen uppercase italic tracking-tighter">No Neural Logs Found.</h3>
                            <p className="text-[10px] font-bold text-muted-gray uppercase tracking-widest opacity-40 max-w-xs leading-relaxed">Complete your first health quiz to initialize vitality tracking.</p>
                        </div>
                        <button className="px-10 py-4 bg-primary text-white rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-medical hover:bg-evergreen transition-all active:scale-95 cursor-pointer">
                            Begin Initial Scan
                        </button>
                    </div>
                )}
            </div>

            {/* Modal: Detailed View (Simplified for now) */}
            <AnimatePresence>
                {selectedQuiz && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedQuiz(null)}
                            className="absolute inset-0 bg-evergreen/40 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[3rem] w-full max-w-2xl p-10 shadow-2xl relative z-10 overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

                            <div className="relative z-10 space-y-10">
                                <div className="flex justify-between items-start pb-8 border-b border-primary/10">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
                                                <History className="w-5 h-5" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Neural Reconstruction</span>
                                        </div>
                                        <h3 className="text-4xl font-black text-evergreen uppercase tracking-tighter italic leading-none">
                                            Attempt <span className="text-secondary">{String(selectedQuiz.id).toUpperCase()}</span>
                                        </h3>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-4xl font-black text-primary italic leading-none">{selectedQuiz.vitalityScore}%</div>
                                        <span className="text-[10px] font-black text-muted-gray uppercase tracking-[0.2em] opacity-40">Precision Level</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div className="space-y-8">
                                        <div className="space-y-6">
                                            <span className="text-[10px] font-black text-evergreen uppercase tracking-widest italic opacity-60">System Responses</span>
                                            <div className="space-y-4">
                                                {selectedQuiz.answers.map((ans, i) => (
                                                    <div key={i} className="flex flex-col gap-1 p-4 bg-primary/[0.02] rounded-2xl border border-primary/5">
                                                        <span className="text-[8px] font-black text-primary uppercase tracking-widest opacity-60">{ans.domain} Optimization</span>
                                                        <p className="text-[11px] font-bold text-evergreen uppercase leading-tight">{ans.question}</p>
                                                        <span className="text-[10px] font-black text-secondary italic uppercase">{ans.answer}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="space-y-6">
                                            <span className="text-[10px] font-black text-evergreen uppercase tracking-widest italic opacity-60">Synthesis Recommendations</span>
                                            <div className="space-y-4">
                                                {selectedQuiz.recommendations.map((recomm, i) => (
                                                    <div key={i} className="group p-4 bg-white border border-primary/10 rounded-2xl shadow-medical space-y-2 hover:border-primary/30 transition-all cursor-pointer">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[11px] font-black text-evergreen uppercase">{recomm.title}</span>
                                                            <div className="w-6 h-6 rounded-lg bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                                <ChevronRight className="w-3 h-3" />
                                                            </div>
                                                        </div>
                                                        <p className="text-[9px] text-muted-gray leading-relaxed font-medium">{recomm.description}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setSelectedQuiz(null)}
                                            className="w-full py-5 bg-evergreen text-white rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-medical hover:bg-primary transition-all active:scale-95"
                                        >
                                            Close Log
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default QuizHistorySection;
