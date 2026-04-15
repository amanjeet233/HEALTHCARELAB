import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Clock, CheckCircle2, Truck, Upload,
  AlertCircle, User, Phone, RefreshCw, Search, XCircle, Activity } from 'lucide-react';
import { technicianService, getTechnicianBookings } from '../../services/technicianService';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import GlassCard from '../../components/common/GlassCard';
import GlassButton from '../../components/common/GlassButton';
import SkeletonBlock from '../../components/common/SkeletonBlock';

// Status badge config
const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  BOOKED:               { label: 'Pending',        bg: '#FFF7ED', color: '#C2410C' },
  REFLEX_PENDING:       { label: 'Reflex Pending', bg: '#EEF2FF', color: '#3730A3' },
  SAMPLE_COLLECTED:     { label: 'Collected',      bg: '#F0FDF4', color: '#16A34A' },
  PROCESSING:           { label: 'Processing',     bg: '#F5F3FF', color: '#7C3AED' },
  PENDING_VERIFICATION: { label: 'Pending Review', bg: '#FFFBEB', color: '#D97706' },
  COMPLETED:            { label: 'Completed',      bg: '#F0FDF4', color: '#15803D' },
  CANCELLED:            { label: 'Cancelled',      bg: '#FFF1F2', color: '#BE123C' },
};

const REJECTION_REASONS = [
  'HEMOLYZED',
  'INSUFFICIENT_VOLUME',
  'LABELING_MISMATCH',
  'CLOTTED',
  'WRONG_CONTAINER',
  'PATIENT_UNAVAILABLE',
  'ADDRESS_MISMATCH',
  'OTHER'
] as const;

type ConsentStatus = {
  bookingId: number;
  testName: string;
  consentRequired: boolean;
  consentCaptured: boolean;
  consentGiven: boolean;
  consentTimestamp?: string;
  collectorId?: number;
  collectorName?: string;
};

const TechnicianDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<Record<number, boolean>>({});
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>({});
  const [hasUploadedReportByBookingId, setHasUploadedReportByBookingId] = useState<Record<number, boolean>>({});
  const [rejectedBookings, setRejectedBookings] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'today' | 'pending' | 'completed' | 'rejected'>('today');
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectPanelId, setRejectPanelId] = useState<number | null>(null);
  const [rejectReasonByBooking, setRejectReasonByBooking] = useState<Record<number, string>>({});
  const [rejectNotesByBooking, setRejectNotesByBooking] = useState<Record<number, string>>({});
  const [consentByBookingId, setConsentByBookingId] = useState<Record<number, ConsentStatus>>({});
  const [consentPanelId, setConsentPanelId] = useState<number | null>(null);
  const [consentAcknowledgedByBooking, setConsentAcknowledgedByBooking] = useState<Record<number, boolean>>({});
  const [consentNameByBooking, setConsentNameByBooking] = useState<Record<number, string>>({});
  const [capturingConsentId, setCapturingConsentId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, bookingsResp, rejectedResp] = await Promise.all([
        technicianService.getDashboardStats(),
        getTechnicianBookings(),
        technicianService.getRejectedSpecimens(),
      ]);
      setStats(statsData || {});
      const raw = bookingsResp.data?.data || bookingsResp.data || [];
      const normalizedBookings = Array.isArray(raw) ? raw : [];
      setBookings(normalizedBookings);
      setRejectedBookings(Array.isArray(rejectedResp) ? rejectedResp : []);

      const processingBookings = normalizedBookings.filter((b: any) => b.status === 'PROCESSING');
      if (processingBookings.length === 0) {
        setHasUploadedReportByBookingId({});
      } else {
        const checks = await Promise.all(
          processingBookings.map(async (b: any) => {
            const report = await technicianService.checkReportExists(b.id);
            return { bookingId: b.id, hasReport: Boolean(report) };
          })
        );
        const reportMap: Record<number, boolean> = {};
        checks.forEach((item) => {
          reportMap[item.bookingId] = item.hasReport;
        });
        setHasUploadedReportByBookingId(reportMap);
      }

      const collectibleBookings = normalizedBookings.filter((b: any) =>
        b.status === 'BOOKED' || b.status === 'REFLEX_PENDING'
      );
      if (collectibleBookings.length === 0) {
        setConsentByBookingId({});
      } else {
        const consentChecks = await Promise.all(
          collectibleBookings.map(async (b: any) => {
            try {
              const status = await technicianService.getConsentStatus(b.id);
              return { bookingId: b.id, status };
            } catch {
              return { bookingId: b.id, status: null };
            }
          })
        );
        const consentMap: Record<number, ConsentStatus> = {};
        consentChecks.forEach(({ bookingId, status }) => {
          if (status) {
            consentMap[bookingId] = status as ConsentStatus;
          }
        });
        setConsentByBookingId(consentMap);
      }
    } catch (err) {
      toast.error('Failed to load bookings');
      setBookings([]);
      setHasUploadedReportByBookingId({});
      setConsentByBookingId({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleMarkCollected = async (bookingId: number) => {
    setUpdating(bookingId);
    try {
      await technicianService.updateCollectionStatus(bookingId);
      toast.success('Sample marked as collected!');
      loadData();
    } catch {
      toast.error('Failed to update status');
    } finally { setUpdating(null); }
  };

  const handleMarkProcessing = async (bookingId: number) => {
    setUpdating(bookingId);
    try {
      await technicianService.updateBookingStatus(bookingId, 'PROCESSING');
      toast.success('Booking marked as processing!');
      loadData();
    } catch {
      toast.error('Failed to update status');
    } finally { setUpdating(null); }
  };

  const handleFileUpload = async (bookingId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      toast.error('Only PDF and image files are allowed');
      return;
    }
    setUploadingFiles(prev => ({ ...prev, [bookingId]: true }));
    setUploadProgress(prev => ({ ...prev, [bookingId]: 0 }));
    try {
      await technicianService.uploadReport(bookingId, file, (percent) => {
        setUploadProgress(prev => ({ ...prev, [bookingId]: percent }));
      });
      setHasUploadedReportByBookingId(prev => ({ ...prev, [bookingId]: true }));
      toast.success('Report uploaded — sent for MO review');
      await loadData();
    } catch {
      toast.error('Failed to upload report');
    } finally {
      setUploadingFiles(prev => ({ ...prev, [bookingId]: false }));
      setUploadProgress(prev => ({ ...prev, [bookingId]: 0 }));
    }
  };

  const handleRejectSpecimen = async (bookingId: number) => {
    const reason = rejectReasonByBooking[bookingId];
    if (!reason) {
      toast.error('Select a rejection reason');
      return;
    }

    setRejectingId(bookingId);
    try {
      await technicianService.rejectSpecimen(bookingId, reason, rejectNotesByBooking[bookingId]);
      toast.success('Sample rejected — patient and admin notified');
      setRejectPanelId(null);
      setRejectReasonByBooking(prev => ({ ...prev, [bookingId]: '' }));
      setRejectNotesByBooking(prev => ({ ...prev, [bookingId]: '' }));
      await loadData();
    } catch {
      toast.error('Failed to reject sample');
    } finally {
      setRejectingId(null);
    }
  };

  const handleCaptureConsent = async (booking: any) => {
    const bookingId = booking.id;
    const acknowledged = Boolean(consentAcknowledgedByBooking[bookingId]);
    const patientName = (consentNameByBooking[bookingId] || '').trim();

    if (!acknowledged) {
      toast.error('Please confirm that patient gave verbal and written consent');
      return;
    }
    if (!patientName) {
      toast.error('Please enter patient name as digital acknowledgment');
      return;
    }

    setCapturingConsentId(bookingId);
    try {
      const result = await technicianService.captureConsent({
        bookingId,
        consentGiven: true,
        patientSignatureData: patientName
      });
      setConsentByBookingId(prev => ({
        ...prev,
        [bookingId]: {
          bookingId,
          testName: result?.testName || booking.testName || 'Lab Test',
          consentRequired: true,
          consentCaptured: true,
          consentGiven: true,
          consentTimestamp: result?.consentTimestamp,
          collectorId: result?.collectorId,
          collectorName: result?.collectorName
        }
      }));
      toast.success('Consent recorded');
      setConsentPanelId(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to capture consent');
    } finally {
      setCapturingConsentId(null);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter(b => b.bookingDate === today);
  const pendingBookings = bookings.filter(b =>
    (b.status === 'BOOKED' || b.status === 'REFLEX_PENDING') && b.bookingDate >= today
  );
  const completedBookings = bookings.filter(b => b.status === 'SAMPLE_COLLECTED' || b.status === 'COMPLETED');
  const rejectedTabBookings = rejectedBookings;
  const displayBookingsBase = activeTab === 'today' ? todayBookings
    : activeTab === 'pending' ? pendingBookings
    : activeTab === 'completed' ? completedBookings
    : rejectedTabBookings;

  const displayBookings = displayBookingsBase.filter((b: any) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      String(b.id || '').toLowerCase().includes(q) ||
      String(b.patientName || '').toLowerCase().includes(q) ||
      String(b.testName || b.packageName || '').toLowerCase().includes(q)
    );
  });

  const statCards = [
    { label: "Today's Bookings", value: stats.todayBookings ?? todayBookings.length, icon: Clock, color: '#0D7C7C' },
    { label: 'Pending Collection', value: stats.pendingCollection ?? pendingBookings.length, icon: Truck, color: '#C2410C' },
    { label: 'Collected Today', value: stats.completedToday ?? completedBookings.length, icon: CheckCircle2, color: '#16A34A' },
    { label: 'Total Assigned', value: stats.totalAssignedBookings ?? bookings.length, icon: User, color: '#7C3AED' },
  ];

  return (
    <div className="max-w-[1200px] w-full mx-auto px-4 md:px-5 py-8 md:py-9 min-h-screen">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="p-2 bg-cyan-500/10 backdrop-blur-md rounded-xl border border-cyan-500/20 shadow-sm">
              <Truck className="w-5 h-5 text-cyan-600" />
            </div>
            <span className="text-[clamp(0.62rem,0.58rem+0.16vw,0.72rem)] font-black uppercase tracking-[0.22em] text-cyan-800/60">
              TECHNICIAN / OPERATIONS
            </span>
          </div>
          <h1 className="text-[clamp(1.7rem,1.2rem+1.7vw,2.7rem)] font-black text-[#164E63] tracking-tight mb-2.5 uppercase">
            Lab <span className="text-cyan-600">Queue</span>
          </h1>
          <p className="text-[clamp(0.84rem,0.8rem+0.3vw,1rem)] text-cyan-900/60 font-medium leading-relaxed">
            Welcome, {currentUser?.name || currentUser?.email?.split('@')[0]}. Track collection, consent, and report uploads.
          </p>
        </div>
        <GlassButton onClick={loadData} className="h-full px-6 py-3.5" icon={<RefreshCw className="w-3.5 h-3.5" />}>
          REFRESH
        </GlassButton>
      </header>

      <div>
        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-7">
          {statCards.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white/60 backdrop-blur-md rounded-xl border border-white/70 p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: color + '15' }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900">{loading ? '—' : value}</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100/70 p-1 rounded-xl mb-5 w-fit">
          {([['today', "Today's"], ['pending', 'Upcoming'], ['completed', 'Completed'], ['rejected', 'Rejected']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}>
              {label} ({key === 'today' ? todayBookings.length : key === 'pending' ? pendingBookings.length : key === 'completed' ? completedBookings.length : rejectedTabBookings.length})
            </button>
          ))}
        </div>

        <GlassCard className="mb-7 border-cyan-100/30">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[260px]">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Search Queue</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-600/50" size={18} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by patient, booking ID or test"
                  className="w-full bg-white/50 border border-white/50 focus:border-cyan-400/50 focus:ring-4 focus:ring-cyan-500/5 rounded-xl pl-10 pr-3 py-2.5 text-sm font-medium transition-all"
                />
              </div>
            </div>
            {searchTerm.trim() && (
              <div className="pt-6">
                <button
                  onClick={() => setSearchTerm('')}
                  className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                  title="Clear Search"
                >
                  <XCircle size={24} />
                </button>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Bookings List */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <SkeletonBlock key={i} className="h-24 border border-white/30" />
            ))}
          </div>
        ) : displayBookings.length === 0 ? (
          <div className="bg-white/70 rounded-xl border border-white/50 p-12 text-center">
            <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No bookings in this category</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayBookings.map((booking: any) => {
              const s = STATUS_CONFIG[booking.status] || STATUS_CONFIG.BOOKED;
              const canCollect = booking.status === 'BOOKED' || booking.status === 'REFLEX_PENDING';
              const canProcess = booking.status === 'SAMPLE_COLLECTED';
              const canReject = booking.status === 'BOOKED' || booking.status === 'SAMPLE_COLLECTED';
              const consentState = consentByBookingId[booking.id];
              const consentRequired = Boolean(consentState?.consentRequired);
              const consentCaptured = Boolean(consentState?.consentCaptured && consentState?.consentGiven);
              const showCaptureConsent = canCollect && consentRequired && !consentCaptured;
              const showMarkCollected = canCollect && (!consentRequired || consentCaptured);
              const hasUploadedReport = Boolean(hasUploadedReportByBookingId[booking.id]);
              const canUpload = booking.status === 'PROCESSING' && !hasUploadedReport;
              const pendingVerification = booking.status === 'PENDING_VERIFICATION' || booking.status === 'VERIFIED' || booking.status === 'COMPLETED';
              const showViewReport = pendingVerification || hasUploadedReport;
              const isRejectedTab = activeTab === 'rejected';
              const displayTimeSlot = booking.timeSlot || booking.preferredTime || 'N/A';
              const displayAddress = booking.collectionAddress || booking.address?.city || booking.address || 'N/A';
              return (
                <div key={booking.id}
                  className="bg-white/70 backdrop-blur-md rounded-xl border border-white/60 p-4 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-wide">
                          #{booking.id}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                          style={{ background: s.bg, color: s.color }}>
                          {s.label}
                        </span>
                      </div>
                      <div className="font-bold text-slate-800 text-sm truncate mb-1">
                        {booking.testName || booking.packageName || 'Lab Test'}
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {booking.patientName || 'Patient'}
                        </span>
                        {booking.patientPhone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {booking.patientPhone}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {displayTimeSlot}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {displayAddress}
                        </span>
                        {isRejectedTab && (
                          <>
                            <span>•</span>
                            <span className="font-semibold text-rose-600">Reason: {booking.rejectionReason || 'N/A'}</span>
                            <span>•</span>
                            <span>Rejected: {booking.rejectedAt ? new Date(booking.rejectedAt).toLocaleString('en-IN') : 'N/A'}</span>
                          </>
                        )}
                        {!isRejectedTab && consentCaptured && (
                          <>
                            <span>•</span>
                            <span className="font-semibold text-emerald-700">Consent recorded</span>
                            {consentState?.consentTimestamp && (
                              <>
                                <span>•</span>
                                <span>{new Date(consentState.consentTimestamp).toLocaleString('en-IN')}</span>
                              </>
                            )}
                            {consentState?.collectorName && (
                              <>
                                <span>•</span>
                                <span>By {consentState.collectorName}</span>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    {!isRejectedTab && <div className="flex flex-col gap-2 shrink-0">
                      {showMarkCollected && (
                        <button
                          onClick={() => handleMarkCollected(booking.id)}
                          disabled={updating === booking.id}
                          className="flex items-center gap-1.5 px-3 py-2 bg-teal-600 text-white rounded-lg text-xs font-bold hover:bg-teal-700 transition-all disabled:opacity-50">
                          {updating === booking.id ? (
                            <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          ) : <CheckCircle2 className="w-3 h-3" />}
                          Mark Collected
                        </button>
                      )}
                      {showCaptureConsent && (
                        <button
                          onClick={() => setConsentPanelId(consentPanelId === booking.id ? null : booking.id)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all">
                          <CheckCircle2 className="w-3 h-3" />
                          Capture Consent
                        </button>
                      )}
                      {canReject && (
                        <button
                          onClick={() => setRejectPanelId(rejectPanelId === booking.id ? null : booking.id)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition-all">
                          <AlertCircle className="w-3 h-3" />
                          Reject Sample
                        </button>
                      )}
                      {canProcess && (
                        <button
                          onClick={() => handleMarkProcessing(booking.id)}
                          disabled={updating === booking.id}
                          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all disabled:opacity-50">
                          {updating === booking.id ? (
                            <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          ) : <Clock className="w-3 h-3" />}
                          Start Processing
                        </button>
                      )}
                      {canUpload && (
                        <label className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 cursor-pointer transition-all disabled:opacity-50">
                          {uploadingFiles[booking.id] ? (
                            <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          ) : <Upload className="w-3 h-3" />}
                          {uploadingFiles[booking.id]
                            ? `Uploading ${uploadProgress[booking.id] ?? 0}%`
                            : 'Upload Report'}
                          <input type="file" className="hidden" accept="application/pdf,image/*" onChange={(e) => handleFileUpload(booking.id, e)} disabled={uploadingFiles[booking.id]} />
                        </label>
                      )}
                      {showViewReport && (
                         <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-500 border border-slate-200 rounded-lg text-xs font-bold">
                           <CheckCircle2 className="w-3 h-3" /> View Report
                         </div>
                      )}
                    </div>}
                  </div>

                  {!isRejectedTab && showCaptureConsent && consentPanelId === booking.id && (
                    <div className="mt-4 border-t border-slate-200 pt-4">
                      <div className="grid gap-3">
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                          <p className="font-bold mb-1">Sensitive test consent required</p>
                          <p>
                            Test: <span className="font-semibold">{consentState?.testName || booking.testName || 'Lab Test'}</span>. This test type needs explicit patient consent before sample collection due legal and privacy requirements.
                          </p>
                        </div>

                        <label className="inline-flex items-start gap-2 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={Boolean(consentAcknowledgedByBooking[booking.id])}
                            onChange={(e) => setConsentAcknowledgedByBooking(prev => ({ ...prev, [booking.id]: e.target.checked }))}
                            className="mt-1"
                          />
                          <span>Patient has given verbal and written consent</span>
                        </label>

                        <div>
                          <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                            Patient Name (Digital Acknowledgment)
                          </label>
                          <input
                            type="text"
                            value={consentNameByBooking[booking.id] || ''}
                            onChange={(e) => setConsentNameByBooking(prev => ({ ...prev, [booking.id]: e.target.value }))}
                            placeholder="Type patient full name"
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-emerald-400"
                          />
                        </div>

                        <div className="flex justify-end">
                          <button
                            onClick={() => void handleCaptureConsent(booking)}
                            disabled={capturingConsentId === booking.id}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-black uppercase tracking-wider hover:bg-emerald-700 disabled:opacity-50"
                          >
                            {capturingConsentId === booking.id ? 'Recording...' : 'Submit Consent'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {!isRejectedTab && rejectPanelId === booking.id && (
                    <div className="mt-4 border-t border-slate-200 pt-4">
                      <div className="grid gap-3">
                        <div>
                          <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                            Rejection Reason
                          </label>
                          <select
                            value={rejectReasonByBooking[booking.id] || ''}
                            onChange={(e) => setRejectReasonByBooking(prev => ({ ...prev, [booking.id]: e.target.value }))}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-rose-400"
                          >
                            <option value="">Select reason</option>
                            {REJECTION_REASONS.map((reason) => (
                              <option key={reason} value={reason}>{reason}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                            Notes (Optional)
                          </label>
                          <textarea
                            value={rejectNotesByBooking[booking.id] || ''}
                            onChange={(e) => setRejectNotesByBooking(prev => ({ ...prev, [booking.id]: e.target.value }))}
                            placeholder="Add optional details"
                            rows={3}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-rose-400 resize-none"
                          />
                        </div>

                        <div className="flex justify-end">
                          <button
                            onClick={() => handleRejectSpecimen(booking.id)}
                            disabled={rejectingId === booking.id}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-black uppercase tracking-wider hover:bg-rose-700 disabled:opacity-50"
                          >
                            {rejectingId === booking.id ? 'Rejecting...' : 'Confirm Reject'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TechnicianDashboardPage;
