import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, 
    FileText, 
    CheckCircle2, 
    Clock, 
    AlertTriangle, 
    Download, 
    Share2, 
    Printer, 
    Eye, 
    X, 
    Calendar,
    Filter,
    BarChart3,
    ShieldAlert,
    ChevronLeft,
    UploadCloud,
    Trash2,
    RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { reportService, type ReportDisplay } from '../services/reportService';
import ReportViewerModal from '../components/reports/ReportViewerModal';
import ReportUploadModal from '../components/reports/ReportUploadModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { notify } from '../utils/toast';
import { useAuth } from '../hooks/useAuth';
import GlassCard from '../components/common/GlassCard';
import GlassButton from '../components/common/GlassButton';

type SortOption = 'date_desc' | 'date_asc' | 'name' | 'status';
type FilterStatus = 'all' | 'ready' | 'pending' | 'processing';

const ReportsPage: React.FC = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [reports, setReports] = useState<ReportDisplay[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('date_desc');
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
    const [selectedReport, setSelectedReport] = useState<ReportDisplay | null>(null);
    const [showViewer, setShowViewer] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [packageFilter, setPackageFilter] = useState('');
    const [packages, setPackages] = useState<string[]>([]);
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareEmail, setShareEmail] = useState('');
    const [sharingReportId, setSharingReportId] = useState<number | null>(null);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        setIsLoading(true);
        try {
            const data = await reportService.getMyReports();
            setReports(data);
        } catch (error) {
            console.error(error);
            notify.error('Failed to load reports.');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredAndSorted = useMemo(() => {
        let result = [...reports];

        if (filterStatus === 'ready') {
            result = result.filter(r => r.hasReport);
        } else if (filterStatus === 'pending') {
            result = result.filter(r => !r.hasReport && r.status === 'PENDING');
        } else if (filterStatus === 'processing') {
            result = result.filter(r => r.status === 'PROCESSING');
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(r =>
                r.testName.toLowerCase().includes(q) ||
                r.bookingId.toString().includes(q)
            );
        }

        if (dateFrom) {
            const fromDate = new Date(dateFrom);
            result = result.filter(r => new Date(r.bookingDate) >= fromDate);
        }
        if (dateTo) {
            const toDate = new Date(dateTo);
            result = result.filter(r => new Date(r.bookingDate) <= toDate);
        }
        if (packageFilter) {
            result = result.filter(r => r.testName.toLowerCase().includes(packageFilter.toLowerCase()));
        }

        switch (sortBy) {
            case 'date_desc':
                result.sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());
                break;
            case 'date_asc':
                result.sort((a, b) => new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime());
                break;
            case 'name':
                result.sort((a, b) => a.testName.localeCompare(b.testName));
                break;
            case 'status':
                result.sort((a, b) => (b.hasReport ? 1 : 0) - (a.hasReport ? 1 : 0));
                break;
        }

        return result;
    }, [reports, searchQuery, sortBy, filterStatus, dateFrom, dateTo, packageFilter]);

    useEffect(() => {
        const uniquePackages = [...new Set(reports.map(r => r.testName))];
        setPackages(uniquePackages);
    }, [reports]);

    const handleDownload = async (report: ReportDisplay) => {
        if (!report.report?.id) {
            notify.error('Report is not available for download.');
            return;
        }
        try {
            await reportService.downloadReport(report.report.id);
            notify.success('Report downloaded.');
        } catch {
            notify.error('Download failure.');
        }
    };

    const handleShareSubmit = async () => {
        if (!sharingReportId || !shareEmail) return;
        try {
            await reportService.shareUserReport(sharingReportId, shareEmail, 'view');
            notify.success(`Report shared with ${shareEmail}.`);
            setShowShareModal(false);
            setShareEmail('');
            setSharingReportId(null);
        } catch {
            notify.error('Failed to assign access.');
        }
    };

    const handleVerify = async (reportId: number) => {
        try {
            await reportService.verifyReport(reportId);
            notify.success('Report verified.');
            await fetchReports();
            setShowViewer(false);
        } catch {
            notify.error('Validation failure.');
        }
    };

    const stats = {
        total: reports.length,
        ready: reports.filter(r => r.hasReport).length,
        processing: reports.filter(r => r.status === 'PROCESSING').length,
        abnormal: reports.filter(r => r.report?.results?.some(res => res.isAbnormal)).length
    };

    if (isLoading && reports.length === 0) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="text-center">
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-cyan-800/60 font-black text-[10px] uppercase tracking-widest animate-pulse">Loading reports...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1200px] w-full mx-auto px-4 md:px-5 py-8 md:py-9 min-h-screen">
            <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-8">
                <div className="max-w-2xl">
                    <button 
                        onClick={() => navigate('/')}
                        className="group flex items-center gap-2 text-cyan-800/60 font-black text-[10px] uppercase tracking-[0.16em] mb-4 hover:text-cyan-600 transition-colors"
                    >
                        <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        BACK TO HOME
                    </button>
                    <div className="flex items-center gap-2.5 mb-3">
                        <div className="p-2 bg-cyan-500/10 backdrop-blur-md rounded-xl border border-cyan-500/20 shadow-sm">
                            <BarChart3 className="w-5 h-5 text-cyan-600" />
                        </div>
                        <span className="text-[clamp(0.62rem,0.58rem+0.15vw,0.72rem)] font-black uppercase tracking-[0.2em] text-cyan-800/60">
                            Reports / History
                        </span>
                    </div>
                    <h1 className="text-[clamp(1.7rem,1.2rem+1.7vw,2.7rem)] font-black text-[#164E63] tracking-tight mb-2.5 uppercase">
                        My <span className="text-cyan-600">Reports</span>
                    </h1>
                    <p className="text-[clamp(0.84rem,0.8rem+0.3vw,1rem)] text-cyan-900/60 font-medium leading-relaxed">
                        View, download, and share your lab reports.
                    </p>
                </div>

                <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3 flex-1 max-w-3xl">
                    {[
                        { icon: FileText, label: 'Total Reports', value: stats.total, color: 'text-cyan-600' },
                        { icon: CheckCircle2, label: 'Verified', value: stats.ready, color: 'text-emerald-500' },
                        { icon: Clock, label: 'In Progress', value: stats.processing, color: 'text-amber-500' },
                        { icon: ShieldAlert, label: 'Anomalies', value: stats.abnormal, color: 'text-rose-500' }
                    ].map((stat, i) => (
                        <GlassCard key={i} className="py-4 flex flex-col items-center justify-center text-center border-white/60 glass-pane hover:border-cyan-400 transition-all">
                             <stat.icon className={`${stat.color} mb-3`} size={20} />
                             <span className="text-[clamp(1.1rem,0.98rem+0.6vw,1.5rem)] font-black text-[#164E63] tracking-tight leading-none mb-1">{stat.value}</span>
                             <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">{stat.label}</span>
                        </GlassCard>
                    ))}
                </div>
            </header>

            <GlassCard className="mb-7 border-white/40">
                <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-6">
                     <div className="flex-1 w-full lg:w-auto">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Quick Search</label>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-600/50" size={18} />
                            <input 
                                type="text"
                                placeholder="Search IDs or Test Tags..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/50 border border-white/50 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/5 rounded-xl pl-10 pr-3 py-2.5 text-sm font-bold text-[#164E63] transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap items-end gap-4 w-full lg:w-auto">
                        <div className="flex-1 lg:flex-none">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Date Range</label>
                            <div className="flex items-center gap-2 bg-white/50 border border-white rounded-xl p-2">
                                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="bg-transparent border-none text-[10px] font-black text-[#164E63] outline-none" />
                                <span className="text-slate-300">/</span>
                                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="bg-transparent border-none text-[10px] font-black text-[#164E63] outline-none" />
                            </div>
                        </div>

                        <div className="flex-1 lg:flex-none">
                             <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Status</label>
                             <div className="relative">
                                <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-600/40" />
                                <select 
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                                    className="bg-white/50 border border-white rounded-xl pl-9 pr-7 py-2.5 text-[11px] font-black text-[#164E63] uppercase tracking-widest outline-none cursor-pointer"
                                >
                                    <option value="all">ALL</option>
                                    <option value="ready">VERIFIED</option>
                                    <option value="processing">PROCESSING</option>
                                    <option value="pending">PENDING</option>
                                </select>
                             </div>
                        </div>

                        {(searchQuery || dateFrom || dateTo || filterStatus !== 'all') && (
                            <GlassButton variant="secondary" className="py-2.5 px-4" onClick={() => { setSearchQuery(''); setDateFrom(''); setDateTo(''); setFilterStatus('all'); }}>
                                <X size={16} />
                            </GlassButton>
                        )}
                    </div>
                </div>
            </GlassCard>

            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {filteredAndSorted.length > 0 ? (
                        filteredAndSorted.map((report, idx) => (
                            <motion.div
                                key={report.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <GlassCard className="p-0 overflow-hidden border-white/40 hover:border-cyan-200/50 transition-all group">
                                    <div className="flex flex-col lg:flex-row items-stretch">
                                        <div className={`w-2 lg:w-4 ${
                                            report.hasReport ? 'bg-emerald-500' : 
                                            report.status === 'PROCESSING' ? 'bg-amber-500' : 
                                            'bg-slate-300'
                                        }`} />
                                        
                                        <div className="flex-1 p-4 lg:p-5 flex flex-col lg:flex-row lg:items-center gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">SID: #{report.bookingId}</span>
                                                    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[9px] font-black uppercase tracking-widest ${
                                                        report.hasReport ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 
                                                        report.status === 'PROCESSING' ? 'bg-amber-50 border-amber-100 text-amber-600' : 
                                                        'bg-slate-50 border-slate-100 text-slate-500'
                                                    }`}>
                                                        {report.hasReport ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                                                        {report.status}
                                                    </div>
                                                </div>
                                                <h3 className="text-[clamp(1.02rem,0.92rem+0.55vw,1.35rem)] font-black text-[#164E63] tracking-tight mb-1.5 group-hover:text-cyan-600 transition-colors uppercase leading-tight">{report.testName}</h3>
                                                <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                    <span className="flex items-center gap-1.5"><Calendar size={12} className="text-cyan-600/50" /> {new Date(report.bookingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                    {report.status === 'PROCESSING' && (
                                                        <span className="text-amber-500 italic">Est. Analysis: 48h</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-3 lg:justify-end">
                                                {report.hasReport ? (
                                                    <>
                                                        <GlassButton 
                                                            variant="secondary" 
                                                            className="flex-1 lg:flex-none border-white"
                                                            onClick={(e) => { e.stopPropagation(); handleDownload(report); }}
                                                            icon={<Download size={16} />}
                                                        >
                                                            DOWNLOAD
                                                        </GlassButton>
                                                        <GlassButton 
                                                            variant="tertiary" 
                                                            className="flex-1 lg:flex-none"
                                                            onClick={(e) => { e.stopPropagation(); setSharingReportId(report.report?.id || null); setShowShareModal(true); }}
                                                            icon={<Share2 size={16} />}
                                                        />
                                                        <GlassButton 
                                                            variant="tertiary" 
                                                            className="flex-1 lg:flex-none"
                                                            onClick={(e) => { e.stopPropagation(); window.open(`/api/users/reports/${report.report?.id}/pdf`, '_blank'); }}
                                                            icon={<Printer size={16} />}
                                                        />
                                                    </>
                                                ) : null}
                                                <GlassButton 
                                                    onClick={() => { setSelectedReport(report); setShowViewer(true); }}
                                                    className="flex-1 lg:flex-none px-6"
                                                    icon={<Eye size={16} />}
                                                >
                                                    VIEW DETAILS
                                                </GlassButton>
                                            </div>
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="py-18 text-center"
                        >
                            <div className="w-16 h-16 bg-slate-100 rounded-[24px] flex items-center justify-center mx-auto mb-5 text-slate-300">
                                <FileText size={48} />
                            </div>
                            <h3 className="text-xl font-black text-[#164E63] tracking-tight mb-2">No Reports Found</h3>
                            <p className="text-slate-400 font-bold text-sm max-w-xs mx-auto mb-10 uppercase tracking-tighter">No reports match your current filters.</p>
                            <GlassButton onClick={() => navigate('/tests')}>BOOK A TEST</GlassButton>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Modals */}
            <ReportViewerModal
                isOpen={showViewer}
                bookingId={selectedReport?.bookingId}
                reportId={selectedReport?.report?.id}
                canVerify={currentUser?.role === 'MEDICAL_OFFICER'}
                onVerify={handleVerify}
                onClose={() => { setShowViewer(false); setSelectedReport(null); }}
            />

            <ReportUploadModal
                isOpen={showUploadModal}
                onClose={() => setShowUploadModal(false)}
                onSuccess={fetchReports}
            />

            {/* Share Modal */}
            <AnimatePresence>
                {showShareModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-cyan-900/40 backdrop-blur-md"
                            onClick={() => setShowShareModal(false)}
                        />
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative w-full max-w-lg bg-white/90 backdrop-blur-xl rounded-[24px] border border-white p-6 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-black text-[#164E63] tracking-tight uppercase">Share Report</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Share this report by email</p>
                                </div>
                                <button onClick={() => setShowShareModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                                    <X size={20} className="text-slate-400" />
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Recipient Email</label>
                                    <div className="relative">
                                        <UploadCloud className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-600/40" size={18} />
                                        <input 
                                            type="email" 
                                            value={shareEmail}
                                            onChange={(e) => setShareEmail(e.target.value)}
                                            placeholder="operator@clinical.com"
                                            className="w-full bg-white/50 border border-slate-100 rounded-xl pl-10 pr-3 py-2.5 text-sm font-bold text-[#164E63] outline-none focus:border-cyan-400 transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="p-4 bg-cyan-50/50 rounded-xl border border-cyan-100/50">
                                    <p className="text-[10px] font-bold text-cyan-800/60 leading-relaxed uppercase">
                                        This person will get access to view this report.
                                    </p>
                                </div>
                                <div className="flex gap-4">
                                    <GlassButton variant="secondary" className="flex-1 py-4" onClick={() => setShowShareModal(false)}>CANCEL</GlassButton>
                                    <GlassButton className="flex-1 py-4" onClick={handleShareSubmit}>GRANT ACCESS</GlassButton>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Admin/Technician Floating Action */}
            {currentUser?.role === 'TECHNICIAN' && (
                <div className="fixed bottom-6 right-6 z-50">
                    <button 
                        onClick={() => setShowUploadModal(true)}
                        className="flex items-center gap-2.5 bg-[#164E63] text-white px-5 py-3 rounded-[20px] font-black text-[11px] uppercase tracking-[0.14em] shadow-2xl shadow-cyan-900/40 hover:-translate-y-1 transition-all active:scale-95"
                    >
                        <UploadCloud size={18} />
                        Upload Report
                    </button>
                </div>
            )}
        </div>
    );
};

export default ReportsPage;
