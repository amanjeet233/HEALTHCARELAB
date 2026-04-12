import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Clock, CheckCircle2, Truck, Upload,
  AlertCircle, User, Phone, ChevronRight, RefreshCw } from 'lucide-react';
import { technicianService, getTechnicianBookings } from '../../services/technicianService';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Status badge config
const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  BOOKED:               { label: 'Pending',        bg: '#FFF7ED', color: '#C2410C' },
  CONFIRMED:            { label: 'Confirmed',      bg: '#EFF6FF', color: '#1D4ED8' },
  SAMPLE_COLLECTED:     { label: 'Collected',      bg: '#F0FDF4', color: '#16A34A' },
  PROCESSING:           { label: 'Processing',     bg: '#F5F3FF', color: '#7C3AED' },
  PENDING_VERIFICATION: { label: 'Pending Review', bg: '#FFFBEB', color: '#D97706' },
  COMPLETED:            { label: 'Completed',      bg: '#F0FDF4', color: '#15803D' },
  CANCELLED:            { label: 'Cancelled',      bg: '#FFF1F2', color: '#BE123C' },
};

const TechnicianDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'today' | 'pending' | 'completed'>('today');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, bookingsResp] = await Promise.all([
        technicianService.getDashboardStats(),
        getTechnicianBookings(),
      ]);
      setStats(statsData || {});
      const raw = bookingsResp.data?.data || bookingsResp.data || [];
      setBookings(Array.isArray(raw) ? raw : []);
    } catch (err) {
      toast.error('Failed to load bookings');
      setBookings([]);
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

  const handleMarkComplete = async (bookingId: number) => {
    setUpdating(bookingId);
    try {
      await technicianService.updateBookingCompletedStatus(bookingId);
      toast.success('Booking marked complete!');
      loadData();
    } catch {
      toast.error('Failed to update status');
    } finally { setUpdating(null); }
  };

  const today = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter(b => b.bookingDate === today || b.collectionDate === today);
  const pendingBookings = bookings.filter(b => b.status === 'BOOKED' || b.status === 'CONFIRMED');
  const completedBookings = bookings.filter(b => b.status === 'SAMPLE_COLLECTED' || b.status === 'COMPLETED');
  const displayBookings = activeTab === 'today' ? todayBookings
    : activeTab === 'pending' ? pendingBookings : completedBookings;

  const statCards = [
    { label: "Today's Bookings", value: stats.todayBookings ?? todayBookings.length, icon: Clock, color: '#0D7C7C' },
    { label: 'Pending Collection', value: stats.pendingCollection ?? pendingBookings.length, icon: Truck, color: '#C2410C' },
    { label: 'Collected Today', value: stats.completedToday ?? completedBookings.length, icon: CheckCircle2, color: '#16A34A' },
    { label: 'Total Assigned', value: stats.totalAssignedBookings ?? bookings.length, icon: User, color: '#7C3AED' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 md:px-8 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Technician Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Welcome, {currentUser?.name || currentUser?.email?.split('@')[0]}
            </p>
          </div>
          <button onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 transition-all">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {statCards.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-200 p-4">
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
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-5 w-fit">
          {([['today', "Today's"], ['pending', 'Pending'], ['completed', 'Completed']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}>
              {label} ({key === 'today' ? todayBookings.length : key === 'pending' ? pendingBookings.length : completedBookings.length})
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse h-24" />
            ))}
          </div>
        ) : displayBookings.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No bookings in this category</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayBookings.map((booking: any) => {
              const s = STATUS_CONFIG[booking.status] || STATUS_CONFIG.BOOKED;
              const canCollect = booking.status === 'BOOKED' || booking.status === 'CONFIRMED';
              const canComplete = booking.status === 'SAMPLE_COLLECTED';
              return (
                <div key={booking.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all">
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
                          {booking.preferredTime || booking.bookingDate}
                        </span>
                        {booking.address && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {booking.address?.city || booking.address}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      {canCollect && (
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
                      {canComplete && (
                        <button
                          onClick={() => handleMarkComplete(booking.id)}
                          disabled={updating === booking.id}
                          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all disabled:opacity-50">
                          <Upload className="w-3 h-3" /> Complete
                        </button>
                      )}
                    </div>
                  </div>
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
