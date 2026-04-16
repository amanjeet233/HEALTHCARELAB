import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText, CheckCircle2, XCircle, AlertTriangle, Clock,
  RefreshCw, User, ChevronDown, ChevronUp, UserCheck,
  Calendar, MapPin, Loader2, Users
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import SmartReportViewer from '../../components/reports/SmartReportViewer';
import type { SmartAnalysis } from '../../services/smartReportService';

// ── Types ──────────────────────────────────────────────────────────────────────

type DeltaCheckEntry = {
  bookingId: number;
  bookingDate: string;
  parameterName: string;
  value: string;
  unit: string;
  referenceRange: string;
  flag: 'H' | 'L' | 'N' | string;
};

type CurrentResultItem = {
  parameterName: string;
  resultValue: string;
  unit: string;
  abnormalStatus?: string;
};

type ReflexSuggestion = {
  id: number;
  bookingId: number;
  triggeredBy: string;
  suggestedTest: string;
  suggestedTestSlug: string;
  priority: 'AUTOMATIC' | 'SUGGESTED' | string;
  status: 'PENDING' | 'ACCEPTED' | 'DISMISSED' | string;
  autoOrdered: boolean;
  reflexBookingId?: number;
  actionReason?: string;
};

type UnassignedBooking = {
  id: number;
  patientName: string;
  testName?: string;
  bookingDate: string;
  timeSlot?: string;
  collectionAddress?: string;
  collectionType: string;
  status: string;
  assignmentType?: string;
  technicianId?: number;
  technicianName?: string;
};

type TechnicianOption = {
  technicianId: number;
  userId: number;
  name: string;
  bookingCountForDate: number;
};

type PipelineStatus = 'BOOKED' | 'SAMPLE_COLLECTED' | 'PROCESSING' | 'PENDING_VERIFICATION' | 'VERIFIED';

type PipelineBooking = {
  id: number;
  patientName: string;
  testName?: string;
  bookingDate: string;
  timeSlot?: string;
  technicianId?: number | null;
  technicianName?: string | null;
  status: string;
};

// ── Main Component ─────────────────────────────────────────────────────────────

const MedicalOfficerDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();

  // Active top-level tab
  const [activeTab, setActiveTab] = useState<'verification' | 'assignments'>('verification');

  // ── Verification Queue state ──────────────────────────────────────
  const [pending, setPending] = useState<any[]>([]);
  const [pendingPage, setPendingPage] = useState(0);
  const [pendingTotalPages, setPendingTotalPages] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [remarks, setRemarks] = useState<Record<number, string>>({});
  const [flaggingId, setFlaggingId] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [deltaByBooking, setDeltaByBooking] = useState<Record<number, DeltaCheckEntry[]>>({});
  const [currentResultsByBooking, setCurrentResultsByBooking] = useState<Record<number, CurrentResultItem[]>>({});
  const [loadingDeltaByBooking, setLoadingDeltaByBooking] = useState<Record<number, boolean>>({});
  const [reflexByBooking, setReflexByBooking] = useState<Record<number, ReflexSuggestion[]>>({});
  const [loadingReflexByBooking, setLoadingReflexByBooking] = useState<Record<number, boolean>>({});

  // ── Pending Assignments state ─────────────────────────────────────
  const [unassigned, setUnassigned] = useState<UnassignedBooking[]>([]);
  const [loadingUnassigned, setLoadingUnassigned] = useState(false);
  // techniciansByDate[bookingDate] = TechnicianOption[]
  const [techniciansByDate, setTechniciansByDate] = useState<Record<string, TechnicianOption[]>>({});
  const [loadingTechsByDate, setLoadingTechsByDate] = useState<Record<string, boolean>>({});
  const [selectedTechByBooking, setSelectedTechByBooking] = useState<Record<number, number>>({});
  const [assigningBooking, setAssigningBooking] = useState<number | null>(null);
  const [previewAnalysis, setPreviewAnalysis] = useState<SmartAnalysis | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // ── Booking Pipeline state (MO full visibility) ──────────────────
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus>('BOOKED');
  const [pipelineBookings, setPipelineBookings] = useState<PipelineBooking[]>([]);
  const [loadingPipeline, setLoadingPipeline] = useState(false);
  const [pipelineTechnicians, setPipelineTechnicians] = useState<Array<{ id: number; name: string }>>([]);
  const [loadingPipelineTechnicians, setLoadingPipelineTechnicians] = useState(false);
  const [pipelineTechnicianByBooking, setPipelineTechnicianByBooking] = useState<Record<number, number>>({});
  const [pipelineAssigningBooking, setPipelineAssigningBooking] = useState<number | null>(null);

  // ── Data loaders ──────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [pendingResp, statsResp] = await Promise.all([
        api.get('/api/mo/pending', { params: { page: 0, size: 10, filter: activeFilter } }),
        api.get('/api/dashboard/medical-officer/stats'),
      ]);
      const pendingPageData = pendingResp.data?.data || {};
      setPending(pendingPageData.content || []);
      setPendingPage(pendingPageData.number || 0);
      setPendingTotalPages(pendingPageData.totalPages || 0);
      setStats(statsResp.data?.data || {});
    } catch {
      toast.error('Failed to load MO data');
    } finally { setLoading(false); }
  }, [activeFilter]);

  const loadPipelineBookings = useCallback(async (status: PipelineStatus) => {
    setLoadingPipeline(true);
    try {
      const resp = await api.get('/api/mo/bookings', {
        params: { status, page: 0, size: 20 }
      });
      const pageData = resp.data?.data || {};
      setPipelineBookings((pageData.content || []) as PipelineBooking[]);
    } catch {
      toast.error('Failed to load booking pipeline');
      setPipelineBookings([]);
    } finally {
      setLoadingPipeline(false);
    }
  }, []);

  const loadPipelineTechnicians = useCallback(async () => {
    if (pipelineTechnicians.length > 0 || loadingPipelineTechnicians) return;
    setLoadingPipelineTechnicians(true);
    try {
      const resp = await api.get('/api/admin/staff/technicians-only');
      const techs = (resp.data?.data || []).map((t: any) => ({ id: t.id, name: t.name }));
      setPipelineTechnicians(techs);
    } catch {
      toast.error('Failed to load technicians');
    } finally {
      setLoadingPipelineTechnicians(false);
    }
  }, [pipelineTechnicians.length, loadingPipelineTechnicians]);

  const handlePipelineAssignTechnician = async (bookingId: number) => {
    const technicianId = pipelineTechnicianByBooking[bookingId];
    if (!technicianId) {
      toast.error('Please select a technician');
      return;
    }

    setPipelineAssigningBooking(bookingId);
    try {
      await api.put(`/api/bookings/${bookingId}/technician`, { technicianId });
      toast.success('Technician assigned');
      await loadPipelineBookings(pipelineStatus);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to assign technician');
    } finally {
      setPipelineAssigningBooking(null);
    }
  };

  const loadUnassignedBookings = useCallback(async () => {
    setLoadingUnassigned(true);
    try {
      const resp = await api.get('/api/mo/bookings/unassigned');
      const bookings: UnassignedBooking[] = resp.data?.data || [];
      setUnassigned(bookings);

      // Pre-fetch technician options for each unique date
      const uniqueDates = [...new Set(bookings.map(b => b.bookingDate).filter(Boolean))];
      await Promise.all(uniqueDates.map(date => loadTechniciansForDate(date)));
    } catch {
      toast.error('Failed to load unassigned bookings');
    } finally { setLoadingUnassigned(false); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadTechniciansForDate = useCallback(async (date: string) => {
    if (techniciansByDate[date] || loadingTechsByDate[date]) return;
    setLoadingTechsByDate(prev => ({ ...prev, [date]: true }));
    try {
      const resp = await api.get('/api/technicians/available-for-date', { params: { date } });
      setTechniciansByDate(prev => ({ ...prev, [date]: resp.data?.data || [] }));
    } catch {
      // Non-critical — dropdown just stays empty
    } finally {
      setLoadingTechsByDate(prev => ({ ...prev, [date]: false }));
    }
  }, [techniciansByDate, loadingTechsByDate]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => {
    if (activeTab === 'verification') {
      loadPipelineBookings(pipelineStatus);
    }
  }, [activeTab, pipelineStatus, loadPipelineBookings]);
  useEffect(() => {
    if (activeTab === 'assignments') loadUnassignedBookings();
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Verification helpers ──────────────────────────────────────────

  const parseNumeric = (raw?: string | null): number | null => {
    if (!raw) return null;
    const n = Number.parseFloat(String(raw).replace(/[^0-9.+-]/g, ''));
    return Number.isFinite(n) ? n : null;
  };

  const getFlagBadgeClass = (flag?: string) => {
    if (flag === 'H') return 'bg-red-50 text-red-700 border-red-200';
    if (flag === 'L') return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  };

  const normalizeCurrentFlag = (abnormalStatus?: string) => {
    const status = (abnormalStatus || '').toUpperCase();
    if (status === 'HIGH') return 'H';
    if (status === 'LOW') return 'L';
    return 'N';
  };

  const hasSignificantChange = (currentValue?: string, previousValue?: string) => {
    const curr = parseNumeric(currentValue);
    const prev = parseNumeric(previousValue);
    if (curr === null || prev === null || prev === 0) return false;
    return Math.abs((curr - prev) / prev) > 0.2;
  };

  const hasPendingReflexActions = (bookingId: number) =>
    (reflexByBooking[bookingId] || []).some(
      (s) => s.priority === 'SUGGESTED' && s.status === 'PENDING' && !s.autoOrdered
    );

  const loadReflexSuggestions = useCallback(async (bookingId: number) => {
    if (reflexByBooking[bookingId]) return;
    setLoadingReflexByBooking(prev => ({ ...prev, [bookingId]: true }));
    try {
      const reflexResp = await api.get(`/api/reflex/${bookingId}`);
      const suggestions = (reflexResp.data?.data || []) as ReflexSuggestion[];
      setReflexByBooking(prev => ({ ...prev, [bookingId]: suggestions }));
    } catch {
      toast.error('Failed to load reflex suggestions');
    } finally {
      setLoadingReflexByBooking(prev => ({ ...prev, [bookingId]: false }));
    }
  }, [reflexByBooking]);

  const loadDeltaDataForBooking = useCallback(async (bookingId: number, patientId?: number, testName?: string) => {
    if (!patientId || !testName) return;
    if (deltaByBooking[bookingId] && currentResultsByBooking[bookingId]) return;
    setLoadingDeltaByBooking(prev => ({ ...prev, [bookingId]: true }));
    try {
      const [deltaResp, currentResp] = await Promise.all([
        api.get('/api/mo/delta-check', { params: { patientId, testName } }),
        api.get(`/api/reports/booking/${bookingId}`)
      ]);
      const deltaRows = (deltaResp.data?.data || []) as DeltaCheckEntry[];
      const currentRows = ((currentResp.data?.data?.results || []) as any[]).map((row) => ({
        parameterName: row?.parameterName || '-',
        resultValue: row?.resultValue || '-',
        unit: row?.unit || '-',
        abnormalStatus: row?.abnormalStatus || 'NORMAL'
      })) as CurrentResultItem[];
      setDeltaByBooking(prev => ({ ...prev, [bookingId]: deltaRows }));
      setCurrentResultsByBooking(prev => ({ ...prev, [bookingId]: currentRows }));
    } catch {
      toast.error('Failed to load previous results');
    } finally {
      setLoadingDeltaByBooking(prev => ({ ...prev, [bookingId]: false }));
    }
  }, [deltaByBooking, currentResultsByBooking]);

  const toggleExpanded = async (bookingId: number, patientId?: number, testName?: string) => {
    const nextExpanded = expandedId === bookingId ? null : bookingId;
    setExpandedId(nextExpanded);
    if (nextExpanded !== null) {
      await Promise.all([
        loadDeltaDataForBooking(bookingId, patientId, testName),
        loadReflexSuggestions(bookingId)
      ]);
    }
  };

  const handleVerify = async (bookingId: number) => {
    if (hasPendingReflexActions(bookingId)) {
      toast.error('Please resolve all suggested reflex tests before final sign-off');
      return;
    }
    const note = remarks[bookingId];
    if (!note || note.trim().length < 10) {
      toast.error('Clinical remarks must be at least 10 characters');
      return;
    }
    setActioning(bookingId);
    try {
      await api.post(`/api/mo/verify/${bookingId}`, {
        clinicalNotes: note,
        digitalSignature: `Digitally signed by ${currentUser?.name || 'MO'}`,
        approved: true,
        specialistType: 'General'
      });
      toast.success('Report verified!');
      setPending(prev => prev.filter(p => (p.id !== bookingId && p.bookingId !== bookingId)));
      setRemarks(prev => { const copy = { ...prev }; delete copy[bookingId]; return copy; });
    } catch {
      toast.error('Verification failed');
    } finally { setActioning(null); }
  };

  const handleAcceptReflex = async (bookingId: number, suggestionId: number) => {
    try {
      const resp = await api.put(`/api/reflex/${suggestionId}/accept`);
      const updated = resp.data?.data as ReflexSuggestion;
      setReflexByBooking(prev => ({
        ...prev,
        [bookingId]: (prev[bookingId] || []).map(s => s.id === suggestionId ? updated : s)
      }));
      toast.success('Reflex order accepted and created');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to accept reflex suggestion');
    }
  };

  const handleDismissReflex = async (bookingId: number, suggestionId: number) => {
    const reason = window.prompt('Dismiss reason (optional):') || '';
    try {
      const resp = await api.put(`/api/reflex/${suggestionId}/dismiss`, { reason });
      const updated = resp.data?.data as ReflexSuggestion;
      setReflexByBooking(prev => ({
        ...prev,
        [bookingId]: (prev[bookingId] || []).map(s => s.id === suggestionId ? updated : s)
      }));
      toast.success('Reflex suggestion dismissed');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to dismiss reflex suggestion');
    }
  };

  const handleReject = async (bookingId: number) => {
    if (!rejectReason.trim()) { toast.error('Enter rejection reason'); return; }
    setActioning(bookingId);
    try {
      await api.post(`/api/mo/reject/${bookingId}`, { reason: rejectReason });
      toast.success('Report rejected');
      setPending(prev => prev.filter(p => (p.id !== bookingId && p.bookingId !== bookingId)));
      setRejectReason('');
      setExpandedId(null);
    } catch {
      toast.error('Rejection failed');
    } finally { setActioning(null); }
  };

  const handleLoadMore = async () => {
    if (loadingMore || pendingPage + 1 >= pendingTotalPages) return;
    setLoadingMore(true);
    try {
      const nextPage = pendingPage + 1;
      const pendingResp = await api.get('/api/mo/pending', {
        params: { page: nextPage, size: 10, filter: activeFilter }
      });
      const pageData = pendingResp.data?.data || {};
      setPending(prev => [...prev, ...(pageData.content || [])]);
      setPendingPage(pageData.number ?? nextPage);
      setPendingTotalPages(pageData.totalPages || pendingTotalPages);
    } catch {
      toast.error('Failed to load more pending reports');
    } finally { setLoadingMore(false); }
  };

  const handlePreviewReport = async (bookingId: number) => {
    setLoadingPreview(true);
    try {
      const resp = await api.get(`/api/reports/analysis/${bookingId}`);
      setPreviewAnalysis(resp.data?.data || null);
    } catch {
      toast.error('Failed to load report preview');
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleFlagCritical = async (bookingId: number) => {
    const confirmed = window.confirm('Mark this booking as CRITICAL and notify admin users?');
    if (!confirmed) return;
    setFlaggingId(bookingId);
    try {
      await api.put(`/api/mo/flag-critical/${bookingId}`);
      toast.success('Flagged as critical');
      setPending(prev => prev.map(item => {
        const id = item.bookingId || item.id;
        return id === bookingId ? { ...item, criticalFlag: true } : item;
      }));
    } catch {
      toast.error('Failed to flag as critical');
    } finally { setFlaggingId(null); }
  };

  // ── Assignment handlers ───────────────────────────────────────────

  const handleAssignTechnician = async (bookingId: number, bookingDate: string) => {
    const technicianId = selectedTechByBooking[bookingId];
    if (!technicianId) { toast.error('Please select a technician first'); return; }

    setAssigningBooking(bookingId);
    try {
      await api.post(`/api/mo/assign-technician/${bookingId}`, { technicianId });
      toast.success('Technician assigned successfully');
      // Move card out of unassigned list
      setUnassigned(prev => prev.filter(b => b.id !== bookingId));
      setSelectedTechByBooking(prev => { const c = { ...prev }; delete c[bookingId]; return c; });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Assignment failed');
    } finally { setAssigningBooking(null); }
  };

  // ── Stat cards ────────────────────────────────────────────────────

  const statCards = [
    { label: 'Pending Review', value: stats.pendingVerifications ?? stats.pendingCount ?? 0, color: '#C2410C', icon: Clock },
    { label: 'Processing', value: stats.processingReports ?? 0, color: '#1D4ED8', icon: FileText },
    { label: 'Critical Alerts', value: stats.criticalAlerts ?? 0, color: '#DC2626', icon: AlertTriangle },
    { label: 'Verified Today', value: stats.totalVerified ?? 0, color: '#16A34A', icon: CheckCircle2 },
  ];

  // ── Render ────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 md:px-8 py-5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Medical Officer Dashboard</h1>
            <p className="text-sm text-slate-500 mt-0.5">Verification queue &amp; technician assignments</p>
          </div>
          <button
            onClick={() => { loadData(); if (activeTab === 'assignments') loadUnassignedBookings(); }}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {statCards.map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ background: color + '15' }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <div className="text-2xl font-black text-slate-900">{value}</div>
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{label}</div>
            </div>
          ))}
        </div>

        {/* Top-level tabs */}
        <div className="flex gap-1 bg-slate-200/50 p-1 rounded-xl mb-6 w-fit">
          <button
            onClick={() => setActiveTab('verification')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-black tracking-wider transition-all ${
              activeTab === 'verification' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Verification Queue
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-black tracking-wider transition-all ${
              activeTab === 'assignments' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" /> Pending Assignments
            {unassigned.length > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-teal-600 text-white text-[10px] font-black">
                {unassigned.length}
              </span>
            )}
          </button>
        </div>

        {/* ── Verification Queue Tab ─────────────────────────────────── */}
        {activeTab === 'verification' && (
          <>
            {/* Subcategory filters */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-5 w-fit">
              {['ALL', 'NEW', 'CRITICAL', 'RECHECK'].map(f => (
                <button key={f} onClick={() => { setActiveFilter(f); setPendingPage(0); }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                    activeFilter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}>
                  {f}
                </button>
              ))}
            </div>

            <h2 className="text-base font-black text-slate-700 mb-3 uppercase tracking-wide">
              Queue: {activeFilter} ({pending.length})
            </h2>

            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse h-20" />)}
              </div>
            ) : pending.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No pending verifications found for this filter</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pending.map((item: any) => {
                  const id = item.bookingId || item.id;
                  const isExpanded = expandedId === id;
                  return (
                    <div key={id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-slate-300 transition-all">
                      <div className="p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-xs font-black text-slate-400">#{id}</span>
                              {(item.criticalFlag || item.anyResultAbnormal) && (
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-red-100 text-red-700 animate-pulse">CRITICAL</span>
                              )}
                              {item.previouslyRejected && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-100 text-orange-700">RECHECK</span>
                              )}
                            </div>
                            <div className="font-bold text-slate-800 text-sm">{item.testName || 'Lab Test'}</div>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                              <User className="w-3.5 h-3.5" />
                              <span className="font-medium">{item.patientName || 'Patient'}</span>
                              <span>·</span>
                              <span className="opacity-75">{item.bookingDate || item.createdAt}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => void toggleExpanded(id, item.patientId, item.testName)}
                              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                                isExpanded ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                              }`}>
                              {isExpanded ? 'Collapse' : 'Actions'}
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-4 pb-5 pt-4 border-t border-slate-100 bg-slate-50/50 space-y-4">
                          {/* Current vs Previous results */}
                          <div className="bg-white border border-slate-200 rounded-xl p-3">
                            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Current Result vs Previous</h3>
                            {loadingDeltaByBooking[id] ? (
                              <p className="text-xs text-slate-500">Loading previous results...</p>
                            ) : (
                              <>
                                {currentResultsByBooking[id]?.length > 0 ? (
                                  <div className="overflow-x-auto">
                                    <table className="min-w-full text-xs">
                                      <thead>
                                        <tr className="text-left text-slate-500 border-b border-slate-200">
                                          <th className="py-2 pr-3">Parameter</th>
                                          <th className="py-2 pr-3">Date</th>
                                          <th className="py-2 pr-3">Value</th>
                                          <th className="py-2 pr-3">Unit</th>
                                          <th className="py-2 pr-3">Flag</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {currentResultsByBooking[id].map((result, index) => {
                                          const previousMatch = (deltaByBooking[id] || []).find(
                                            entry => (entry.parameterName || '').toLowerCase() === (result.parameterName || '').toLowerCase()
                                          );
                                          const significant = hasSignificantChange(result.resultValue, previousMatch?.value);
                                          const flag = normalizeCurrentFlag(result.abnormalStatus);
                                          return (
                                            <tr key={`${result.parameterName}-${index}`} className={`border-b border-slate-100 ${significant ? 'bg-rose-50/80' : ''}`}>
                                              <td className="py-2 pr-3 font-semibold text-slate-700">{result.parameterName}</td>
                                              <td className="py-2 pr-3 text-slate-600">{item.bookingDate || '-'}</td>
                                              <td className={`py-2 pr-3 ${significant ? 'text-rose-700 font-bold' : 'text-slate-700'}`}>
                                                {result.resultValue}
                                                {significant && <span className="ml-2 inline-flex text-[10px] font-black text-rose-600">Δ &gt; 20%</span>}
                                              </td>
                                              <td className="py-2 pr-3 text-slate-600">{result.unit || '-'}</td>
                                              <td className="py-2 pr-3">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-black ${getFlagBadgeClass(flag)}`}>{flag}</span>
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                ) : (
                                  <p className="text-xs text-slate-500">Current result details unavailable.</p>
                                )}
                              </>
                            )}
                          </div>

                          {/* Previous results */}
                          <div className="bg-white border border-slate-200 rounded-xl p-3">
                            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Previous Results (Last 3 Completed)</h3>
                            {(deltaByBooking[id] || []).length === 0 ? (
                              <p className="text-xs text-slate-500">No previous results</p>
                            ) : (
                              <div className="overflow-x-auto">
                                <table className="min-w-full text-xs">
                                  <thead>
                                    <tr className="text-left text-slate-500 border-b border-slate-200">
                                      <th className="py-2 pr-3">Parameter</th>
                                      <th className="py-2 pr-3">Date</th>
                                      <th className="py-2 pr-3">Value</th>
                                      <th className="py-2 pr-3">Unit</th>
                                      <th className="py-2 pr-3">Flag</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(deltaByBooking[id] || []).map((entry, idx) => (
                                      <tr key={`${entry.bookingId}-${entry.parameterName}-${idx}`} className="border-b border-slate-100">
                                        <td className="py-2 pr-3 font-semibold text-slate-700">{entry.parameterName}</td>
                                        <td className="py-2 pr-3 text-slate-600">{entry.bookingDate || '-'}</td>
                                        <td className="py-2 pr-3 text-slate-700">{entry.value || '-'}</td>
                                        <td className="py-2 pr-3 text-slate-600">{entry.unit || '-'}</td>
                                        <td className="py-2 pr-3">
                                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-black ${getFlagBadgeClass(entry.flag)}`}>
                                            {entry.flag || 'N'}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>

                          {/* Reflex Tests */}
                          <div className="bg-white border border-amber-200 rounded-xl p-3">
                            <div className="mb-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                              Triggered follow-up tests based on result values.
                            </div>
                            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Reflex Tests</h3>
                            {loadingReflexByBooking[id] ? (
                              <p className="text-xs text-slate-500">Loading reflex suggestions...</p>
                            ) : (reflexByBooking[id] || []).length === 0 ? (
                              <p className="text-xs text-slate-500">No reflex suggestions triggered for this booking.</p>
                            ) : (
                              <div className="space-y-2">
                                {(reflexByBooking[id] || []).map((s) => (
                                  <div key={s.id} className="border border-slate-200 rounded-lg p-2 flex items-center justify-between gap-3">
                                    <div className="text-xs text-slate-700">
                                      <p><span className="font-semibold">Triggered by:</span> {s.triggeredBy}</p>
                                      <p><span className="font-semibold">Suggested test:</span> {s.suggestedTest}</p>
                                      <p className="text-[11px] text-slate-500">Status: {s.status}</p>
                                    </div>
                                    <div className="shrink-0 flex items-center gap-2">
                                      {s.autoOrdered || s.priority === 'AUTOMATIC' ? (
                                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-wider">Auto-Ordered</span>
                                      ) : s.status === 'PENDING' ? (
                                        <>
                                          <button onClick={() => void handleAcceptReflex(id, s.id)}
                                            className="px-3 py-1.5 rounded-md bg-emerald-600 text-white text-[11px] font-black uppercase tracking-wider hover:bg-emerald-700">Accept</button>
                                          <button onClick={() => void handleDismissReflex(id, s.id)}
                                            className="px-3 py-1.5 rounded-md bg-white text-red-600 border border-red-200 text-[11px] font-black uppercase tracking-wider hover:bg-red-50">Dismiss</button>
                                        </>
                                      ) : (
                                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-wider">{s.status}</span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Clinical remarks */}
                          <div>
                            <label className="text-[10px] font-black text-slate-500 block mb-2 uppercase tracking-widest">Clinical Remarks (Required - Min 10 Chars)</label>
                            <textarea
                              value={remarks[id] || ''}
                              onChange={e => setRemarks(prev => ({ ...prev, [id]: e.target.value }))}
                              placeholder="Please enter clinical observations, remarks on abnormalities, or general health assessment..."
                              className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 min-h-[100px] bg-white transition-all"
                            />
                            <div className="mt-1 flex justify-end">
                              <span className={`text-[10px] font-black ${(remarks[id]?.length || 0) < 10 ? 'text-red-400' : 'text-teal-600'}`}>
                                {(remarks[id]?.length || 0)} characters
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex gap-2">
                              <button onClick={() => handleVerify(id)}
                                disabled={actioning === id || (remarks[id]?.trim().length || 0) < 10 || hasPendingReflexActions(id)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-md shadow-emerald-600/20">
                                <CheckCircle2 className="w-4 h-4" /> Verify Report
                              </button>
                              <button onClick={() => handlePreviewReport(id)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-200 transition-all">
                                <FileText className="w-4 h-4" /> Preview
                              </button>
                              <button onClick={() => handleReject(id)}
                                disabled={actioning === id}
                                className="flex items-center gap-2 px-5 py-2.5 bg-white text-red-600 border border-red-200 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-red-50 disabled:opacity-50 transition-all">
                                <XCircle className="w-4 h-4" /> Reject
                              </button>
                            </div>

                            {!item.criticalFlag ? (
                              <button onClick={() => handleFlagCritical(id)} disabled={flaggingId === id}
                                className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-600/20">
                                <AlertTriangle className="w-3.5 h-3.5" /> {flaggingId === id ? 'Flagging...' : 'Flag As Critical'}
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-100 text-red-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-200">
                                <AlertTriangle className="w-3.5 h-3.5" /> Critical Flagged
                              </span>
                            )}
                          </div>

                          {hasPendingReflexActions(id) && (
                            <p className="text-[11px] text-amber-700 font-semibold">Resolve all suggested reflex tests before final sign-off.</p>
                          )}

                          <div className="pt-2 border-t border-slate-200/50">
                            <label className="text-[10px] font-black text-slate-400 block mb-2 uppercase tracking-widest">Rejection Context</label>
                            <input
                              value={rejectReason}
                              onChange={e => setRejectReason(e.target.value)}
                              placeholder="Provide reasoning only if rejecting (e.g. Invalid sample, values out of biological range)..."
                              className="w-full px-4 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-red-400 bg-white"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {pendingPage + 1 < pendingTotalPages && (
                  <div className="pt-4">
                    <button onClick={handleLoadMore} disabled={loadingMore}
                      className="w-full px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 disabled:opacity-50 transition-all">
                      {loadingMore ? 'Loading Data...' : 'Load Additional Reports'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Booking Pipeline Overview */}
            <section className="mt-8">
              <div className="flex items-center justify-between gap-3 mb-3">
                <h2 className="text-base font-black text-slate-700 uppercase tracking-wide">Booking Pipeline</h2>
                <button
                  onClick={() => loadPipelineBookings(pipelineStatus)}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <RefreshCw className={`w-3 h-3 ${loadingPipeline ? 'animate-spin' : ''}`} /> Refresh
                </button>
              </div>

              <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-4 w-fit flex-wrap">
                {(['BOOKED', 'SAMPLE_COLLECTED', 'PROCESSING', 'PENDING_VERIFICATION', 'VERIFIED'] as PipelineStatus[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => setPipelineStatus(status)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                      pipelineStatus === status ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              {loadingPipeline ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse h-24" />
                  ))}
                </div>
              ) : pipelineBookings.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                  <p className="text-slate-500 font-medium">No bookings found for {pipelineStatus}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pipelineBookings.map((booking) => {
                    const assigned = booking.technicianId && booking.technicianName && booking.technicianName !== 'Unassigned';
                    const selectedTechId = pipelineTechnicianByBooking[booking.id];
                    return (
                      <div key={booking.id} className="bg-white rounded-xl border border-slate-200 p-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-xs font-black text-slate-400">#{booking.id}</span>
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">{booking.status}</span>
                            </div>
                            <p className="font-bold text-slate-800 text-sm">{booking.testName || 'Lab Test'}</p>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                              <span className="flex items-center gap-1"><User className="w-3 h-3" />{booking.patientName || 'Patient'}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{booking.bookingDate}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{booking.timeSlot || 'N/A'}</span>
                              <span>•</span>
                              <span className={`font-bold ${assigned ? 'text-teal-700' : 'text-amber-600'}`}>
                                {assigned ? booking.technicianName : 'Unassigned'}
                              </span>
                            </div>
                          </div>

                          {pipelineStatus === 'BOOKED' && (
                            <div className="flex flex-col sm:flex-row gap-2 md:min-w-[320px]">
                              <select
                                value={selectedTechId || ''}
                                onFocus={() => void loadPipelineTechnicians()}
                                onChange={(e) => setPipelineTechnicianByBooking(prev => ({
                                  ...prev,
                                  [booking.id]: Number(e.target.value)
                                }))}
                                className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white outline-none focus:border-teal-500"
                              >
                                <option value="">Select technician</option>
                                {pipelineTechnicians.map((tech) => (
                                  <option key={tech.id} value={tech.id}>{tech.name}</option>
                                ))}
                              </select>

                              <button
                                onClick={() => handlePipelineAssignTechnician(booking.id)}
                                disabled={!selectedTechId || pipelineAssigningBooking === booking.id}
                                className="px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-black uppercase tracking-wider hover:bg-teal-700 disabled:opacity-50"
                              >
                                {pipelineAssigningBooking === booking.id ? 'Assigning...' : 'Assign Technician'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}

        {/* ── Pending Assignments Tab ────────────────────────────────── */}
        {activeTab === 'assignments' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-black text-slate-700 uppercase tracking-wide">
                Unassigned Bookings ({unassigned.length})
              </h2>
              <button onClick={loadUnassignedBookings}
                disabled={loadingUnassigned}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <RefreshCw className={`w-3 h-3 ${loadingUnassigned ? 'animate-spin' : ''}`} /> Refresh
              </button>
            </div>

            {loadingUnassigned ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse h-32" />)}
              </div>
            ) : unassigned.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 font-semibold">All bookings have technicians assigned</p>
                <p className="text-slate-400 text-sm mt-1">No pending assignments in your jurisdiction</p>
              </div>
            ) : (
              <div className="space-y-3">
                {unassigned.map((booking) => {
                  const techs: TechnicianOption[] = techniciansByDate[booking.bookingDate] || [];
                  const isAssigning = assigningBooking === booking.id;
                  const selectedTech = selectedTechByBooking[booking.id];

                  return (
                    <div key={booking.id}
                      className="bg-white rounded-xl border border-slate-200 hover:border-teal-300 transition-all overflow-hidden">
                      {/* Card header */}
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-black text-slate-400">#{booking.id}</span>
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 uppercase tracking-wider">
                                Unassigned
                              </span>
                            </div>

                            <p className="font-bold text-slate-800 text-sm mb-2">
                              {booking.testName || 'Lab Test'}
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-xs text-slate-600">
                              <div className="flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="font-medium truncate">{booking.patientName || 'Patient'}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>{booking.bookingDate}{booking.timeSlot ? ` · ${booking.timeSlot}` : ''}</span>
                              </div>
                              {booking.collectionAddress && (
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span className="truncate">{booking.collectionAddress}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Assignment row */}
                      <div className="px-4 pb-4 pt-0 border-t border-slate-100 bg-slate-50/40 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <div className="flex-1 w-full">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">
                            Assign Technician
                          </label>
                          {loadingTechsByDate[booking.bookingDate] ? (
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading technicians...
                            </div>
                          ) : (
                            <select
                              id={`tech-select-${booking.id}`}
                              value={selectedTech ?? ''}
                              onChange={e => setSelectedTechByBooking(prev => ({
                                ...prev,
                                [booking.id]: Number(e.target.value)
                              }))}
                              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all"
                            >
                              <option value="">— Select technician —</option>
                              {techs.length === 0 && (
                                <option value="" disabled>No technicians available</option>
                              )}
                              {techs.map(tech => (
                                <option key={tech.userId} value={tech.userId}>
                                  {tech.name}
                                  {tech.bookingCountForDate > 0
                                    ? ` (${tech.bookingCountForDate} booking${tech.bookingCountForDate !== 1 ? 's' : ''} today)`
                                    : ' (free today)'}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>

                        <button
                          id={`assign-btn-${booking.id}`}
                          onClick={() => handleAssignTechnician(booking.id, booking.bookingDate)}
                          disabled={isAssigning || !selectedTech}
                          className="flex items-center gap-2 px-5 py-2 bg-teal-600 text-white rounded-lg text-xs font-black uppercase tracking-wider hover:bg-teal-700 disabled:opacity-50 transition-all whitespace-nowrap shadow-md shadow-teal-600/20 mt-4 sm:mt-0 self-end sm:self-auto"
                        >
                          {isAssigning
                            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Assigning...</>
                            : <><UserCheck className="w-3.5 h-3.5" /> Assign</>}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Preview Modal */}
      {previewAnalysis && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-black text-slate-800 uppercase tracking-tight">Clinical Report Preview</h3>
              <button 
                onClick={() => setPreviewAnalysis(null)}
                className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                title="Close"
              >
                <XCircle className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
              <SmartReportViewer analysis={previewAnalysis} />
            </div>
            <div className="p-4 border-t border-slate-200 bg-white flex justify-end">
              <button 
                onClick={() => setPreviewAnalysis(null)}
                className="px-6 py-2 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {loadingPreview && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-white/20 backdrop-blur-[2px]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
            <span className="text-xs font-black text-teal-800 uppercase tracking-widest">Generating Live Preview...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalOfficerDashboardPage;
