import React, { useEffect, useMemo, useState } from 'react';
import {
    Activity,
    AlertTriangle,
    Brain,
    Calendar,
    CalendarDays,
    Download,
    FileText,
    Search,
    Stethoscope,
    UtensilsCrossed
} from 'lucide-react';
import { reportService, type AIAnalysis, type ReportDisplay } from '../../services/reportService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { notify } from '../../utils/toast';

const STATUS_BADGE: Record<string, string> = {
    PENDING_VERIFICATION: 'bg-amber-50 text-amber-700 border-amber-200',
    VERIFIED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    COMPLETED: 'bg-teal-50 text-teal-700 border-teal-200'
};

const canDownload = (status: string) => status === 'VERIFIED' || status === 'COMPLETED';

const getHealthScoreClass = (score: number) => {
    if (score >= 80) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (score >= 60) return 'bg-amber-100 text-amber-700 border-amber-200';
    if (score >= 40) return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-rose-100 text-rose-700 border-rose-200';
};

const getSeverityClass = (severity: string) => {
    switch (severity?.toUpperCase()) {
        case 'CRITICAL':
            return 'bg-rose-50 text-rose-700 border-rose-200';
        case 'MODERATE':
            return 'bg-orange-50 text-orange-700 border-orange-200';
        case 'MILD':
            return 'bg-amber-50 text-amber-700 border-amber-200';
        default:
            return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
};

const recommendationIcon = (category: string) => {
    switch ((category ?? '').toUpperCase()) {
        case 'DIET':
            return <UtensilsCrossed size={14} />;
        case 'LIFESTYLE':
            return <Activity size={14} />;
        case 'FOLLOWUP':
            return <CalendarDays size={14} />;
        case 'CONSULT':
            return <Stethoscope size={14} />;
        default:
            return <Brain size={14} />;
    }
};

const ReportsPage: React.FC = () => {
    const [reports, setReports] = useState<ReportDisplay[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [aiAnalysisByBooking, setAiAnalysisByBooking] = useState<Record<number, AIAnalysis | null>>({});
    const [aiLoadingByBooking, setAiLoadingByBooking] = useState<Record<number, boolean>>({});
    const [showAiByBooking, setShowAiByBooking] = useState<Record<number, boolean>>({});

    useEffect(() => {
        void loadReports();
    }, []);

    const loadReports = async () => {
        setLoading(true);
        try {
            const data = await reportService.getMyReports();
            setReports(data);
        } catch (error) {
            console.error(error);
            notify.error('Failed to load reports.');
        } finally {
            setLoading(false);
        }
    };

    const filtered = useMemo(() => {
        if (!search.trim()) return reports;
        const q = search.toLowerCase();
        return reports.filter((r) =>
            r.testName.toLowerCase().includes(q) || String(r.bookingId).includes(q)
        );
    }, [reports, search]);

    const handleDownload = async (bookingId: number) => {
        try {
            await reportService.downloadReport(bookingId);
        } catch (error) {
            console.error(error);
            notify.error('Failed to download report.');
        }
    };

    const loadAiAnalysis = async (bookingId: number) => {
        setAiLoadingByBooking((prev) => ({ ...prev, [bookingId]: true }));
        try {
            const analysis = await reportService.getAIAnalysis(bookingId);
            setAiAnalysisByBooking((prev) => ({ ...prev, [bookingId]: analysis }));
        } catch (error) {
            console.error(error);
            notify.error('Failed to load AI insights.');
        } finally {
            setAiLoadingByBooking((prev) => ({ ...prev, [bookingId]: false }));
        }
    };

    const toggleInsights = async (bookingId: number) => {
        const isOpen = Boolean(showAiByBooking[bookingId]);
        setShowAiByBooking((prev) => ({ ...prev, [bookingId]: !isOpen }));
        if (!isOpen && aiAnalysisByBooking[bookingId] === undefined) {
            await loadAiAnalysis(bookingId);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="mb-6">
                <h1 className="text-2xl font-black text-[#164E63] uppercase tracking-tight">My Reports</h1>
                <p className="text-sm text-cyan-900/60 font-medium mt-1">
                    View verified reports and download files after MO sign-off.
                </p>
            </div>

            <div className="relative mb-6">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-700/40" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by test name or booking ID"
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-sm outline-none focus:border-cyan-400"
                />
            </div>

            {filtered.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
                    <FileText className="mx-auto text-slate-300 mb-3" size={40} />
                    <p className="text-lg font-bold text-slate-700">No reports yet</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map((report) => {
                        const badgeClass = STATUS_BADGE[report.status] ?? 'bg-slate-50 text-slate-600 border-slate-200';
                        const bookingDate = report.bookingDate ? new Date(report.bookingDate).toLocaleDateString('en-IN') : 'N/A';
                        const reportDate = report.reportDate ? new Date(report.reportDate).toLocaleString('en-IN') : 'Pending';

                        return (
                            <div key={report.bookingId} className="bg-white border border-slate-200 rounded-2xl p-5">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-[#164E63]">{report.testName}</h3>
                                        <div className="mt-2 space-y-1 text-sm text-slate-600">
                                            <p className="flex items-center gap-2">
                                                <Calendar size={14} />
                                                Booking Date: {bookingDate}
                                            </p>
                                            <p>Booking ID: {report.bookingId}</p>
                                            <p>Verified By: {report.verifiedByName || 'Pending'}</p>
                                            <p>Report Date: {reportDate}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-start md:items-end gap-3">
                                        <span className={`px-3 py-1 rounded-md border text-xs font-bold ${badgeClass}`}>
                                            {report.status}
                                        </span>

                                        {canDownload(report.status) ? (
                                            <div className="flex items-center gap-2">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 border border-red-200 text-red-700 text-[11px] font-black uppercase tracking-wider">
                                                    <FileText size={14} />
                                                    PDF
                                                </span>
                                                <button
                                                    onClick={() => void toggleInsights(report.bookingId)}
                                                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-cyan-200 bg-cyan-50 text-cyan-800 text-sm font-bold hover:bg-cyan-100"
                                                >
                                                    <Brain size={15} />
                                                    AI Insights
                                                </button>
                                                <button
                                                    onClick={() => void handleDownload(report.bookingId)}
                                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-700 text-white text-sm font-bold hover:bg-cyan-800"
                                                >
                                                    <Download size={16} />
                                                    Download
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md border border-amber-200 bg-amber-50 text-amber-700 text-xs font-bold">
                                                Pending PDF
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {showAiByBooking[report.bookingId] && (
                                    <div className="mt-4 border-t border-slate-100 pt-4 space-y-4">
                                        {aiLoadingByBooking[report.bookingId] ? (
                                            <div className="text-sm text-cyan-700 font-semibold">Generating your health insights...</div>
                                        ) : aiAnalysisByBooking[report.bookingId] ? (
                                            <>
                                                <div className="rounded-xl border border-cyan-100 bg-cyan-50/50 p-4">
                                                    <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                                                        <h4 className="text-sm font-black uppercase tracking-wider text-cyan-800">AI Health Insights</h4>
                                                        <span className={`px-3 py-1 rounded-md border text-xs font-black ${getHealthScoreClass(aiAnalysisByBooking[report.bookingId]!.healthScore)}`}>
                                                            Health Score: {aiAnalysisByBooking[report.bookingId]!.healthScore}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-700">{aiAnalysisByBooking[report.bookingId]!.summary}</p>
                                                </div>

                                                {aiAnalysisByBooking[report.bookingId]!.flags.length > 0 && (
                                                    <div>
                                                        <h5 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Risk Flags</h5>
                                                        <div className="grid gap-2">
                                                            {aiAnalysisByBooking[report.bookingId]!.flags.map((flag, idx) => (
                                                                <div key={`${flag.testName}-${idx}`} className="rounded-lg border border-slate-200 bg-white p-3">
                                                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                                                        <span className="text-sm font-bold text-slate-800">{flag.testName}</span>
                                                                        <span className="text-xs text-slate-600">Value: {flag.value}</span>
                                                                        <span className={`px-2 py-0.5 rounded-md border text-[11px] font-bold ${getSeverityClass(flag.severity)}`}>
                                                                            {flag.severity}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-xs text-slate-600">{flag.clinicalNote}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {aiAnalysisByBooking[report.bookingId]!.patterns.length > 0 && (
                                                    <div>
                                                        <h5 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Detected Patterns</h5>
                                                        <div className="space-y-2">
                                                            {aiAnalysisByBooking[report.bookingId]!.patterns.map((pattern, idx) => (
                                                                <div key={`${report.bookingId}-pattern-${idx}`} className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
                                                                    <div className="flex items-start gap-2">
                                                                        <AlertTriangle size={14} className="mt-0.5 text-amber-600" />
                                                                        <span>{pattern}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {aiAnalysisByBooking[report.bookingId]!.recommendations.length > 0 && (
                                                    <div>
                                                        <h5 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Recommendations</h5>
                                                        <div className="grid gap-2">
                                                            {aiAnalysisByBooking[report.bookingId]!.recommendations.map((rec, idx) => (
                                                                <div key={`${report.bookingId}-rec-${idx}`} className="rounded-lg border border-slate-200 bg-white p-3">
                                                                    <div className="flex items-center gap-2 text-xs font-bold text-cyan-800 mb-1">
                                                                        {recommendationIcon(rec.category)}
                                                                        {rec.category}
                                                                    </div>
                                                                    <p className="text-sm text-slate-700">{rec.text}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                                                    {aiAnalysisByBooking[report.bookingId]!.disclaimer || 'AI-generated insights are for informational purposes only and do not replace medical advice.'}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="rounded-lg border border-cyan-100 bg-cyan-50 px-3 py-2 text-sm text-cyan-800 font-semibold">
                                                Generating your health insights...
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ReportsPage;
