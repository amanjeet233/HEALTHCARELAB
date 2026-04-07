import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaSortAmountDown, FaFileAlt, FaCheckCircle, FaClock, FaExclamationTriangle } from 'react-icons/fa';
import { reportService, type ReportDisplay } from '../services/reportService';
import ReportCard from '../components/reports/ReportCard';
import ReportViewerModal from '../components/reports/ReportViewerModal';
import ReportUploadModal from '../components/reports/ReportUploadModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { GenericPageSkeleton } from '../components/ui/PageSkeleton';
import { notify } from '../utils/toast';
import { useAuth } from '../hooks/useAuth';
import './ReportsPage.css';

type SortOption = 'date_desc' | 'date_asc' | 'name' | 'status';
type FilterStatus = 'all' | 'ready' | 'pending';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
    { value: 'date_desc', label: 'Latest First' },
    { value: 'date_asc', label: 'Oldest First' },
    { value: 'name', label: 'Test Name A-Z' },
    { value: 'status', label: 'Status' }
];

const ReportsPage: React.FC = () => {
    const { currentUser } = useAuth();

    const [reports, setReports] = useState<ReportDisplay[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('date_desc');
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
    const [selectedReport, setSelectedReport] = useState<ReportDisplay | null>(null);
    const [showViewer, setShowViewer] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);

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

        // Filter by status
        if (filterStatus === 'ready') {
            result = result.filter(r => r.hasReport);
        } else if (filterStatus === 'pending') {
            result = result.filter(r => !r.hasReport);
        }

        // Search
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(r =>
                r.testName.toLowerCase().includes(q) ||
                r.bookingId.toString().includes(q)
            );
        }

        // Sort
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
    }, [reports, searchQuery, sortBy, filterStatus]);

    const handleView = (report: ReportDisplay) => {
        setSelectedReport(report);
        setShowViewer(true);
    };

    const handleDownload = async (report: ReportDisplay) => {
        if (!report.report?.id) {
            notify.error('Report not available for download.');
            return;
        }
        try {
            await reportService.downloadReport(report.report.id);
            notify.success('Report downloaded!');
        } catch {
            notify.error('Download failed.');
        }
    };

    const handleVerify = async (reportId: number) => {
        try {
            await reportService.verifyReport(reportId);
            notify.success('Report verified successfully.');
            await fetchReports();
            setShowViewer(false);
            setSelectedReport(null);
        } catch {
            notify.error('Failed to verify report.');
        }
    };

    const readyCount = reports.filter(r => r.hasReport).length;
    const pendingCount = reports.filter(r => !r.hasReport).length;
    const abnormalCount = reports.filter(r => r.report?.results?.some(res => res.isAbnormal)).length;

    return (
        <div className="reports-page">
            {/* PAGE HEADER */}
            <header className="reports-header">
                <div className="reports-header-section">
                    <span className="reports-header-label">📊 Diagnostic Intelligence</span>
                    <h1>
                        My <span>Reports</span>
                    </h1>
                    <p className="reports-header-description">
                        Access your lab test results, download PDF reports, and track pending diagnostics — all in one place.
                    </p>
                </div>

                {/* STATISTICS CARDS */}
                <div className="stats-grid">
                    {[
                        { icon: FaFileAlt, label: 'Total Reports', value: reports.length.toString(), color: 'primary' },
                        { icon: FaCheckCircle, label: 'Ready', value: readyCount.toString(), color: 'success' },
                        { icon: FaClock, label: 'Pending', value: pendingCount.toString(), color: 'pending' },
                        { icon: FaExclamationTriangle, label: 'Needs Attention', value: abnormalCount.toString(), color: 'alert' }
                    ].map((stat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="stat-card"
                        >
                            <stat.icon className={`stat-icon ${stat.color}`} />
                            <p className="stat-value">{stat.value}</p>
                            <p className="stat-label">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>

                {/* UPLOAD BUTTON */}
                {currentUser?.role === 'TECHNICIAN' && (
                    <div className="upload-section">
                        <button
                            type="button"
                            onClick={() => setShowUploadModal(true)}
                            className="upload-btn"
                        >
                            Upload Report
                        </button>
                    </div>
                )}
            </header>

            {/* FILTERS & SEARCH */}
            <div className="filters-bar">
                {/* Search */}
                <div className="search-input">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by test name or booking ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Status Filter */}
                <div className="status-filter">
                    {([
                        { key: 'all', label: 'All' },
                        { key: 'ready', label: 'Ready' },
                        { key: 'pending', label: 'Pending' }
                    ] as const).map((opt) => (
                        <button
                            key={opt.key}
                            onClick={() => setFilterStatus(opt.key)}
                            className={`filter-btn ${filterStatus === opt.key ? 'active' : ''}`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                {/* Sort */}
                <div className="sort-group">
                    <FaSortAmountDown className="sort-icon" />
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="sort-select"
                    >
                        {SORT_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* RESULTS */}
            {isLoading ? (
                <GenericPageSkeleton />
            ) : filteredAndSorted.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="empty-reports"
                >
                    <FaFileAlt className="empty-icon" />
                    <h3>No Reports Found</h3>
                    <p>
                        {searchQuery ? 'Try adjusting your search query.' : 'Your lab test reports will appear here after booking tests.'}
                    </p>
                </motion.div>
            ) : (
                <>
                    <div className="results-count">
                        <span>
                            {filteredAndSorted.length} report{filteredAndSorted.length !== 1 ? 's' : ''} found
                        </span>
                    </div>

                    <div className="reports-grid">
                        {filteredAndSorted.map((report, idx) => (
                            <ReportCard
                                key={report.id}
                                report={report}
                                index={idx}
                                onView={handleView}
                                onDownload={handleDownload}
                            />
                        ))}
                    </div>
                </>
            )}

            {/* Report Viewer Modal */}
            <ReportViewerModal
                isOpen={showViewer}
                bookingId={selectedReport?.bookingId}
                reportId={selectedReport?.report?.id}
                canVerify={currentUser?.role === 'MEDICAL_OFFICER'}
                onVerify={handleVerify}
                onClose={() => {
                    setShowViewer(false);
                    setSelectedReport(null);
                }}
            />

            <ReportUploadModal
                isOpen={showUploadModal}
                onClose={() => setShowUploadModal(false)}
                onSuccess={async () => {
                    await fetchReports();
                    setShowUploadModal(false);
                }}
            />
        </div>
    );
};

export default ReportsPage;
