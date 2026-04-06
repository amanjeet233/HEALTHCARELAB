import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Apple, Brain, RefreshCw, ChevronRight, HeartPulse, Loader2 } from 'lucide-react';
import MagneticButton from '../ui/MagneticButton';
import { quizService, type QuizResult } from '../../services/quizService';
import { notify } from '../../utils/toast';

const HealthQuiz: React.FC = () => {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<{ questionId: number, answer: string }[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<QuizResult | null>(null);

    const questions = [
        {
            id: 1,
            q: "Current Vitality Goal?",
            options: ["Weight Loss", "Muscle Gain", "Endurance", "General Fitness"],
            icon: <Heart className="w-4 h-4" />,
            color: "#FF6B6B", // Soft Coral
            domain: "Fitness"
        },
        {
            id: 2,
            q: "Nutritional Insight?",
            options: ["Plant Based", "High Protein", "Balanced", "Keto/Paleo"],
            icon: <Apple className="w-4 h-4" />,
            color: "#10B981", // Emerald
            domain: "Nutrition"
        },
        {
            id: 3,
            q: "Mental Equilibrium?",
            options: ["Focus", "Stress Relief", "Creativity", "Better Mood"],
            icon: <Brain className="w-4 h-4" />,
            color: "#8B5CF6", // Purple
            domain: "Mental"
        }
    ];

    const handleOption = async (opt: string) => {
        const newAnswers = [...answers, {
            questionId: questions[step].id,
            answer: opt
        }];
        setAnswers(newAnswers);

        if (step < questions.length - 1) {
            setStep(step + 1);
        } else {
            setIsSubmitting(true);
            try {
                const completion = await quizService.submitQuiz(newAnswers);
                setResult(completion);
                setStep(questions.length);
                notify.success('Vitality synthesis complete.');
            } catch (error) {
                notify.error('Synthesis interrupted. Try again.');
                setIsSubmitting(false);
            }
        }
    };

    const reset = () => {
        setStep(0);
        setAnswers([]);
        setIsSubmitting(false);
        setResult(null);
    };

    return (
        <div className="w-full max-w-md bg-gradient-to-br from-[#08555F] to-[#0D2320] p-5 md:p-6 rounded-[1.5rem] shadow-medical relative overflow-hidden border border-white/5 mx-auto lg:mx-0">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none" />

            <AnimatePresence mode="wait">
                {isSubmitting ? (
                    <motion.div
                        key="submitting"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-12 space-y-6"
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                            <Loader2 className="w-12 h-12 text-electric-cyan" />
                        </motion.div>
                        <p className="text-[10px] font-black text-electric-cyan uppercase tracking-[0.4em] animate-pulse text-center">
                            Synthesizing Vitality Biometrics...
                        </p>
                    </motion.div>
                ) : step < questions.length ? (
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        className="space-y-4 relative z-10"
                    >
                        <div className="flex justify-center">
                            <div
                                className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg"
                                style={{ backgroundColor: questions[step].color, boxShadow: `0 0 15px ${questions[step].color}40` }}
                            >
                                <div className="scale-90">
                                    {questions[step].icon}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5 text-center">
                            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-electric-cyan opacity-80">
                                {questions[step].domain} Intelligence — 0{step + 1}
                            </span>
                            <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-tighter leading-tight italic">
                                {questions[step].q}
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {questions[step].options.map((opt) => (
                                <button
                                    key={opt}
                                    onClick={() => handleOption(opt)}
                                    className="flex items-center justify-between px-3.5 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-bold text-[10px] hover:bg-white/10 hover:border-electric-cyan transition-all group cursor-pointer"
                                >
                                    {opt}
                                    <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-8px] group-hover:translate-x-0 text-electric-cyan" />
                                </button>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center space-y-4 relative z-10"
                    >
                        <div className="w-12 h-12 mx-auto bg-electric-cyan rounded-full flex items-center justify-center shadow-cyan-glow">
                            <HeartPulse className="w-6 h-6 text-ever-green" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-[54px] font-black text-white italic leading-none tracking-tighter">{result?.vitalityScore}%</span>
                                <div className="text-left">
                                    <div className="text-[10px] font-black text-electric-cyan uppercase leading-none mb-1">Vitality Score</div>
                                    <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-electric-cyan" style={{ width: `${result?.vitalityScore}%` }} />
                                    </div>
                                </div>
                            </div>
                            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">System Synthesized.</h3>
                        </div>

                        <div className="bg-white/5 rounded-2xl p-4 space-y-3 text-left">
                            <span className="text-[8px] font-black text-muted-gray uppercase tracking-widest opacity-40">AI Protocol Recommendations</span>
                            <div className="space-y-2">
                                {result?.recommendations.map(recomm => (
                                    <div key={recomm.title} className="flex flex-col gap-1 group/recomm">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-white uppercase">{recomm.title}</span>
                                        </div>
                                        <p className="text-[8px] text-muted-gray font-medium leading-tight">{recomm.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-3">
                            <MagneticButton className="bg-electric-cyan text-ever-green px-8 py-3 rounded-full font-black uppercase tracking-widest text-[9px] shadow-cyan-glow hover:scale-105 transition-transform">
                                VIEW HISTORY
                            </MagneticButton>
                            <button
                                onClick={reset}
                                className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.2em] text-gray-blue hover:text-white transition-colors cursor-pointer"
                            >
                                <RefreshCw className="w-2 h-2" /> RE-SCAN BIOMETRICS
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HealthQuiz;
