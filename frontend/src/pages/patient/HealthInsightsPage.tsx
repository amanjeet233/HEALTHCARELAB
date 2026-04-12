import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    Activity,
    TrendingUp,
    TrendingDown,
    Minus,
    Filter,
    Calendar,
    AlertCircle,
    CheckCircle2,
    Info,
    ArrowRight,
    Search,
    RefreshCw,
    HeartPulse,
    ShieldCheck,
    Zap
} from 'lucide-react';
import { healthScoreService, type HealthScore, type HealthMetric, type HealthTrend, type HealthRecommendation } from '../services/healthScoreService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { notify } from '../utils/toast';
import GlassCard from '../components/common/GlassCard';
import GlassButton from '../components/common/GlassButton';

const HealthInsightsPage: React.FC = () => {
    const navigate = useNavigate();
    const [healthScore, setHealthScore] = useState<HealthScore | null>(null);
    const [metrics, setMetrics] = useState<HealthMetric[]>([]);
    const [trends, setTrends] = useState<HealthTrend[]>([]);
    const [recommendations, setRecommendations] = useState<HealthRecommendation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [metricFilter, setMetricFilter] = useState('all');
    const [dateRange, setDateRange] = useState('6months');

    const loadHealthInsights = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const [score, metricsData, trendsData, recommsData] = await Promise.all([
                healthScoreService.getCurrentScore(),
                healthScoreService.getHealthMetrics(),
                healthScoreService.getScoreTrends(30),
                healthScoreService.getRecommendations()
            ]);
            setHealthScore(score);
            setMetrics(metricsData);
            setTrends(trendsData);
            setRecommendations(recommsData);
        } catch (err: any) {
            console.error('Error loading health insights:', err);
            const errorMsg = err.message || 'Failed to load health insights';
            setError(errorMsg);
            notify.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadHealthInsights();
    }, [metricFilter, dateRange]);

    const getScoreCategoryStyle = (category: string) => {
        switch (category) {
            case 'EXCELLENT': return { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.2)]' };
            case 'GOOD': return { bg: 'bg-cyan-500/10', text: 'text-cyan-500', border: 'border-cyan-500/20', glow: 'shadow-[0_0_20px_rgba(6,182,212,0.2)]' };
            case 'FAIR': return { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20', glow: 'shadow-[0_0_20px_rgba(245,158,11,0.2)]' };
            case 'POOR': return { bg: 'bg-rose-500/10', text: 'text-rose-500', border: 'border-rose-500/20', glow: 'shadow-[0_0_20px_rgba(244,63,94,0.2)]' };
            default: return { bg: 'bg-slate-500/10', text: 'text-slate-500', border: 'border-slate-500/20', glow: '' };
        }
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'IMPROVING': return <TrendingUp className="text-emerald-500" size={18} />;
            case 'DECLINING': return <TrendingDown className="text-rose-500" size={18} />;
            default: return <Minus className="text-slate-400" size={18} />;
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="text-center">
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-cyan-800/60 font-bold uppercase tracking-widest text-xs animate-pulse">Loading health data...</p>
                </div>
            </div>
        );
    }

    const scoreStyle = healthScore ? getScoreCategoryStyle(healthScore.category) : getScoreCategoryStyle('UNKNOWN');

    return (
        <div className="max-w-[1200px] w-full mx-auto px-4 md:px-5 py-8 md:py-9 min-h-screen">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
                <div className="max-w-2xl">
                    <button
                        onClick={() => navigate('/')}
                        className="group flex items-center gap-2 text-cyan-800/60 font-black text-[10px] uppercase tracking-[0.16em] mb-4 hover:text-cyan-600 transition-colors"
                    >
                        <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        Return to Hub
                    </button>
                    <div className="flex items-center gap-2.5 mb-3">
                        <div className="p-2 bg-white/50 backdrop-blur-md rounded-xl border border-white/20 shadow-sm">
                            <HeartPulse className="w-5 h-5 text-cyan-600" />
                        </div>
                        <span className="text-[clamp(0.62rem,0.58rem+0.16vw,0.72rem)] font-extrabold uppercase tracking-[0.16em] text-cyan-800/60">
                            Health / Insights
                        </span>
                    </div>
                    <h1 className="text-[clamp(1.7rem,1.2rem+1.7vw,2.7rem)] font-black text-[#164E63] tracking-tight mb-2.5">
                        Health <span className="text-cyan-600">Insights</span>
                    </h1>
                    <p className="text-[clamp(0.84rem,0.8rem+0.3vw,1rem)] text-cyan-900/60 font-medium leading-relaxed">
                        View your health score, trends, and recommendations.
                    </p>
                </div>

                <div className="flex flex-wrap gap-4">
                    <GlassButton
                        onClick={loadHealthInsights}
                        variant="secondary"
                        icon={<RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />}
                    >
                        REFRESH DATA
                    </GlassButton>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 mb-6 items-stretch">
                {/* Main Score Card */}
                <GlassCard className="xl:col-span-3 h-full relative overflow-hidden group border-white/40">
                    <div className="relative z-10">
                        <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-5">Health Score</h3>
                        <div className="flex flex-col items-center justify-center py-3">
                            <div className={`w-36 h-36 rounded-full border-8 ${scoreStyle.border} ${scoreStyle.glow} flex flex-col items-center justify-center relative bg-white/30 backdrop-blur-md mb-5`}>
                                <span className={`text-[clamp(1.7rem,1.25rem+1.5vw,2.4rem)] font-black ${scoreStyle.text} tracking-tight`}>{healthScore?.score || 'N/A'}</span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Score</span>
                                <div className="absolute inset-4 rounded-full border border-dashed border-slate-200 animate-[spin_20s_linear_infinite]" />
                            </div>
                            <div className={`px-4 py-1.5 rounded-xl ${scoreStyle.bg} ${scoreStyle.text} border ${scoreStyle.border} font-black text-[10px] tracking-widest uppercase`}>
                                Status: {healthScore?.category || 'LOADING'}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-5 pt-5 border-t border-slate-100/50">
                            <div className="text-center">
                                <span className="block text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Last Sync</span>
                                <span className="text-sm font-bold text-[#164E63]">09 APR 2026</span>
                            </div>
                            <div className="text-center">
                                <span className="block text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Reliability</span>
                                <span className="text-sm font-bold text-emerald-500">99.8%</span>
                            </div>
                        </div>
                    </div>
                </GlassCard>

                {/* Metrics Grid */}
                <div className="xl:col-span-9 flex flex-col gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {[
                            { name: 'CHOL', label: 'Cholesterol Total', value: '220', unit: 'mg/dL', status: 'HIGH', color: 'text-rose-500', icon: <Zap size={18} /> },
                            { name: 'GLUC', label: 'Glucose Fasting', value: '125', unit: 'mg/dL', status: 'NORMAL', color: 'text-emerald-500', icon: <Activity size={18} /> },
                            { name: 'SYS/DIA', label: 'Blood Pressure', value: '130/85', unit: 'mmHg', status: 'ELEVATED', color: 'text-amber-500', icon: <ShieldCheck size={18} /> }
                        ].map((m, i) => (
                            <GlassCard key={i} className="h-full group hover:border-white/60 transition-all">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.name}</span>
                                    <div className={`p-1.5 rounded-lg bg-white/50 border border-white/20 ${m.color}`}>
                                        {m.icon}
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <h4 className="text-[10px] font-bold text-[#164E63]/60 mb-1">{m.label}</h4>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-[clamp(1.05rem,0.92rem+0.6vw,1.45rem)] font-black text-[#164E63] tracking-tight">{m.value}</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">{m.unit}</span>
                                    </div>
                                </div>
                                <div className={`inline-flex px-3 py-1 rounded-full bg-white/40 border border-white/20 text-[9px] font-black tracking-widest ${m.color}`}>
                                    {m.status}
                                </div>
                            </GlassCard>
                        ))}
                    </div>

                    <GlassCard className="min-h-[220px] border-white/40">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="text-cyan-600" size={18} />
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trend (6 Months)</h3>
                            </div>
                            <div className="flex gap-2">
                                {['1M', '3M', '6M', '1Y'].map(t => (
                                    <button key={t} className={`px-3 py-1 rounded-lg text-[9px] font-black tracking-widest transition-all ${t === '6M' ? 'bg-cyan-600 text-white' : 'bg-white/50 text-slate-400 border border-white/20 hover:border-cyan-200'}`}>
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-5">
                            {trends.map((trend, idx) => (
                                <div key={idx} className="relative">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <span className="text-xs font-black text-[#164E63] tracking-tight">{trend.metric}</span>
                                            <span className="ml-2 text-[10px] text-slate-400 font-bold italic">Stable</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {getTrendIcon(trend.trend)}
                                            <span className="text-[9px] font-black uppercase tracking-widest text-[#164E63]">{trend.trend}</span>
                                        </div>
                                    </div>
                                    <div className="h-12 w-full relative group">
                                        <svg viewBox="0 0 300 60" className="w-full h-full overflow-visible">
                                            <defs>
                                                <linearGradient id={`grad-${idx}`} x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#0891b2" stopOpacity="0.2" />
                                                    <stop offset="100%" stopColor="#0891b2" stopOpacity="0" />
                                                </linearGradient>
                                            </defs>
                                            <motion.path
                                                initial={{ pathLength: 0, opacity: 0 }}
                                                animate={{ pathLength: 1, opacity: 1 }}
                                                transition={{ duration: 1, delay: idx * 0.2 }}
                                                d={`M0,${60 - (trend.values[0] / Math.max(...trend.values)) * 40} ${trend.values.slice(1).map((v, i) => `L${(i + 1) * (300 / (trend.values.length - 1))},${60 - (v / Math.max(...trend.values)) * 40}`).join(' ')}`}
                                                fill="none"
                                                stroke="#0891b2"
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                            />
                                            <path
                                                d={`M0,${60 - (trend.values[0] / Math.max(...trend.values)) * 40} ${trend.values.slice(1).map((v, i) => `L${(i + 1) * (300 / (trend.values.length - 1))},${60 - (v / Math.max(...trend.values)) * 40}`).join(' ')} L300,60 L0,60 Z`}
                                                fill={`url(#grad-${idx})`}
                                            />
                                        </svg>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </div>
            </div>

            <section className="mb-8">
                <header className="flex items-center gap-4 mb-5">
                    <div className="flex-1 h-px bg-slate-200/50" />
                    <div className="flex items-center gap-2 px-6">
                        <AlertCircle className="text-cyan-600" size={20} />
                        <h2 className="text-[11px] font-black text-[#164E63] uppercase tracking-[0.2em]">Recommendations</h2>
                    </div>
                    <div className="flex-1 h-px bg-slate-200/50" />
                </header>

                <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
                    {recommendations.length > 0 ? (
                        recommendations.map((rec, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * idx }}
                            >
                                <GlassCard className={`h-full border-l-4 ${rec.priority === 'HIGH' ? 'border-l-rose-500' :
                                    rec.priority === 'MEDIUM' ? 'border-l-amber-500' :
                                        'border-l-emerald-500'
                                    }`}>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`p-2 rounded-xl bg-white/40 border border-white/20 ${rec.priority === 'HIGH' ? 'text-rose-500' :
                                            rec.priority === 'MEDIUM' ? 'text-amber-500' :
                                                'text-emerald-500'
                                            }`}>
                                            {rec.priority === 'HIGH' ? <AlertCircle size={18} /> : <Info size={18} />}
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{rec.category}</span>
                                    </div>
                                    <h4 className="text-base font-black text-[#164E63] tracking-tight mb-2">{rec.recommendation}</h4>
                                    <ul className="space-y-1.5 mb-4">
                                        {rec.actionItems.map((item, i) => (
                                            <li key={i} className="flex items-start gap-2 text-xs text-[#164E63]/70 font-bold leading-relaxed">
                                                <div className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-cyan-600/40" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                    <GlassButton
                                        variant="tertiary"
                                        className="w-full py-3"
                                        onClick={() => navigate('/tests')}
                                    >
                                        <div className="flex items-center justify-between w-full px-2">
                                            <span>VIEW TESTS</span>
                                            <ArrowRight size={14} />
                                        </div>
                                    </GlassButton>
                                </GlassCard>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full py-8 text-center">
                            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                            <h3 className="text-lg font-black text-[#164E63] tracking-tight">No Risk Alerts</h3>
                            <p className="text-slate-400 text-sm font-medium">All key health metrics are in a safe range.</p>
                        </div>
                    )}
                </div>
            </section>

            <footer className="mt-8 pt-5 border-t border-slate-200/50">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-2">
                    <div className="flex items-center gap-4">
                        <ShieldCheck className="text-cyan-600/40" size={24} />
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest max-w-[300px]">
                            Health insights are informational. Please consult your doctor for medical decisions.
                        </p>
                    </div>
                    <GlassButton
                        variant="secondary"
                        onClick={() => navigate('/')}
                    >
                        BACK HOME
                    </GlassButton>
                </div>
            </footer>
        </div>
    );
};

export default HealthInsightsPage;
