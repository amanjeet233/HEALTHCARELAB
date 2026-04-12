import React, { useState, useEffect, useCallback } from 'react';
import { FileText, CheckCircle2, XCircle, AlertTriangle,
  Clock, Eye, RefreshCw, User, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const MedicalOfficerDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [pending, setPending] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [pendingResp, statsResp] = await Promise.all([
        api.get('/api/mo/pending'),
        api.get('/api/dashboard/medical-officer/stats'),
      ]);
      setPending(pendingResp.data?.data || []);
      setStats(statsResp.data?.data || {});
    } catch {
      toast.error('Failed to load MO data');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleVerify = async (bookingId: number) => {
    setActioning(bookingId);
    try {
      await api.post(`/api/mo/verify/${bookingId}`, {
        verificationNotes: 'Verified by MO',
        status: 'VERIFIED',
      });
      toast.success('Report verified!');
      setPending(prev => prev.filter(p => p.id !== bookingId && p.bookingId !== bookingId));
    } catch {
      toast.error('Verification failed');
    } finally { setActioning(null); }
  };

  const handleReject = async (bookingId: number) => {
    if (!rejectReason.trim()) { toast.error('Enter rejection reason'); return; }
    setActioning(bookingId);
    try {
      await api.post(`/api/mo/reject/${bookingId}`, { reason: rejectReason });
      toast.success('Report rejected');
      setPending(prev => prev.filter(p => p.id !== bookingId && p.bookingId !== bookingId));
      setRejectReason('');
      setExpandedId(null);
    } catch {
      toast.error('Rejection failed');
    } finally { setActioning(null); }
  };

  const statCards = [
    { label: 'Pending Review', value: stats.pendingVerifications ?? pending.length, color: '#C2410C', icon: Clock },
    { label: 'Processing', value: stats.processingReports ?? 0, color: '#1D4ED8', icon: FileText },
    { label: 'Critical Alerts', value: stats.criticalAlerts ?? 0, color: '#DC2626', icon: AlertTriangle },
    { label: 'Verified Today', value: stats.totalVerified ?? 0, color: '#16A34A', icon: CheckCircle2 },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-4 md:px-8 py-5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Medical Officer</h1>
            <p className="text-sm text-slate-500 mt-0.5">Report verification queue</p>
          </div>
          <button onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {statCards.map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                style={{ background: color + '15' }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <div className="text-2xl font-black text-slate-900">{loading ? '—' : value}</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        <h2 className="text-base font-black text-slate-700 mb-3 uppercase tracking-wide">
          Pending Verifications ({pending.length})
        </h2>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse h-20" />)}
          </div>
        ) : pending.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No pending verifications</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map((item: any) => {
              const id = item.bookingId || item.id;
              const isExpanded = expandedId === id;
              return (
                <div key={id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-black text-slate-400">#{id}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700">
                            Pending Review
                          </span>
                        </div>
                        <div className="font-bold text-slate-800 text-sm">
                          {item.testName || item.packageName || 'Lab Test'}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <User className="w-3 h-3" />
                          {item.patientName || 'Patient'}
                          <span>·</span>
                          <Clock className="w-3 h-3" />
                          {item.bookingDate || item.createdAt}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => handleVerify(id)}
                          disabled={actioning === id}
                          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 disabled:opacity-50">
                          <CheckCircle2 className="w-3 h-3" /> Verify
                        </button>
                        <button onClick={() => setExpandedId(isExpanded ? null : id)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-700 rounded-lg text-xs font-bold hover:bg-red-100 border border-red-100">
                          <XCircle className="w-3 h-3" /> Reject
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-0 border-t border-slate-100 bg-slate-50">
                      <label className="text-xs font-bold text-slate-600 block mb-1.5">Rejection reason</label>
                      <div className="flex gap-2">
                        <input
                          value={rejectReason}
                          onChange={e => setRejectReason(e.target.value)}
                          placeholder="Enter reason for rejection..."
                          className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-red-400"
                        />
                        <button onClick={() => handleReject(id)}
                          disabled={actioning === id}
                          className="px-3 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 disabled:opacity-50">
                          Confirm Reject
                        </button>
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

export default MedicalOfficerDashboardPage;
