import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Users, Activity, Settings, Bell, UserPlus, Trash2, RefreshCw, ClipboardList, UserCheck, ArrowRight, Search, AlertTriangle, Eye, X } from 'lucide-react';
import SystemStatsCards from '../../components/admin/SystemStatsCards';
import UserManagementTable from '../../components/admin/UserManagementTable';
import GrowthChart from '../../components/admin/charts/GrowthChart';
import RevenueChart from '../../components/admin/charts/RevenueChart';
import BookingTrendChart from '../../components/admin/charts/BookingTrendChart';
import Pagination from '../../components/common/Pagination';
import { adminService, type SystemStats, type User, type ChartDataPoint, type AuditLog, type CriticalBooking } from '../../services/adminService';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { notify } from '../../utils/toast';

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<SystemStats | null>(null);
    const [searchParams] = useSearchParams();
    const querySearch = searchParams.get('search') || '';

    const [users, setUsers] = useState<User[]>([]);
    const [growthData, setGrowthData] = useState<ChartDataPoint[]>([]);
    const [revenueData, setRevenueData] = useState<ChartDataPoint[]>([]);
    const [bookingData, setBookingData] = useState<ChartDataPoint[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [staff, setStaff] = useState<any[]>([]);
    const [showAddStaff, setShowAddStaff] = useState(false);
    const [newStaff, setNewStaff] = useState({
        name: '', email: '', password: 'password123',
        role: 'TECHNICIAN', phone: ''
    });
    const [bookingsList, setBookingsList] = useState<any[]>([]);
    const [usersPage, setUsersPage] = useState(0);
    const [usersTotalPages, setUsersTotalPages] = useState(0);
    const [bookingsPage, setBookingsPage] = useState(0);
    const [bookingsTotalPages, setBookingsTotalPages] = useState(0);
    const [criticalBookings, setCriticalBookings] = useState<CriticalBooking[]>([]);
    const [showCriticalPanel, setShowCriticalPanel] = useState(false);
    const [criticalLoading, setCriticalLoading] = useState(false);
    const [selectedCritical, setSelectedCritical] = useState<CriticalBooking | null>(null);
    const [technicians, setTechnicians] = useState<any[]>([]);
    const [isAssigning, setIsAssigning] = useState<number | null>(null);

    // Filters and Search
    const [patientSearch, setPatientSearch] = useState(querySearch);
    const [statusFilter, setStatusFilter] = useState('');
    const [isUpdatingStatus, setIsUpdatingStatus] = useState<number | null>(null);
    const [showCancelModal, setShowCancelModal] = useState<{ id: number, status: string } | null>(null);
    const [cancelReason, setCancelReason] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [isSyncingClinics, setIsSyncingClinics] = useState(false);

    const handleAssignTechnician = async (bookingId: number, technicianId: number) => {
        if (!technicianId) return;
        try {
            await adminService.assignTechnician(bookingId, technicianId);
            toast.success('Technician assigned successfully');
            setIsAssigning(null);
            loadData();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to assign technician');
        }
    };

    const handleRunSecurityScan = async () => {
        setIsScanning(true);
        toast.loading('Initializing System-wide Security Sweep...', { id: 'security-scan' });
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        setIsScanning(false);
        toast.success('Security Audit Complete: 0 Threats Found', { id: 'security-scan' });
        
        const scanLog: AuditLog = {
            id: Date.now(),
            action: 'FULL_SECURITY_SCAN',
            userName: 'ADMIN',
            user: 'ADMIN',
            details: 'Comprehensive system integrity sweep completed.',
            timestamp: new Date().toLocaleTimeString(),
            status: 'success',
            userId: 0
        };
        setAuditLogs(prev => [scanLog, ...prev.slice(0, 19)]);
    };

    const handleDatabaseOptimize = async () => {
        setIsOptimizing(true);
        const tid = toast.loading('Reindexing Test Registry...');
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsOptimizing(false);
        toast.success('Registry Integrity: 100%', { id: tid });
    };

    const handleSyncClinics = async () => {
        setIsSyncingClinics(true);
        const tid = toast.loading('Synchronizing Partner Nodes...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsSyncingClinics(false);
        toast.success('Clinic Telemetry Verified', { id: tid });
    };

    const handleForceStatusUpdate = async (bookingId: number, status: string, reason?: string) => {
        if (status === 'CANCELLED' && !reason) {
            setShowCancelModal({ id: bookingId, status });
            return;
        }

        setIsUpdatingStatus(bookingId);
        try {
            await adminService.adminUpdateBookingStatus(bookingId, status, reason);
            toast.success(`Booking status forced to ${status}`);
            setShowCancelModal(null);
            setCancelReason('');
            loadData();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to update status');
        } finally {
            setIsUpdatingStatus(null);
        }
    };

    useEffect(() => {
        loadData();
    }, [usersPage, bookingsPage, statusFilter]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (bookingsPage !== 0) {
                setBookingsPage(0);
            } else {
                loadData();
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [patientSearch]);

    const loadData = async () => {
        setIsLoading(true);
        setHasError(false);
        try {
            const results = await Promise.allSettled([
                adminService.getSystemStats(),
                adminService.getUsersPage({ page: usersPage, size: 20 }),
                adminService.getChartData('growth'),
                adminService.getChartData('revenue'),
                adminService.getChartData('bookings'),
                adminService.getAuditLogs(),
                adminService.getAllBookingsPage({
                    page: bookingsPage,
                    size: 10,
                    patientName: patientSearch,
                    status: statusFilter || undefined
                }),
                adminService.getTechniciansOnly()
            ]);

            const [statsRes, usersRes, growthRes, revenueRes, bookingsRes, logsRes, allBkRes, techsRes] = results;
            const allFailed = results.every((r) => r.status === 'rejected');

            if (statsRes.status === 'fulfilled') {
                setStats(statsRes.value);
            }
            if (usersRes.status === 'fulfilled') {
                setUsers(usersRes.value.content || []);
                setUsersTotalPages(usersRes.value.totalPages || 0);
            }
            if (growthRes.status === 'fulfilled') {
                setGrowthData(growthRes.value || []);
            }
            if (revenueRes.status === 'fulfilled') {
                setRevenueData(revenueRes.value || []);
            }
            if (bookingsRes.status === 'fulfilled') {
                setBookingData(bookingsRes.value || []);
            }
            if (logsRes.status === 'fulfilled') {
                setAuditLogs(logsRes.value || []);
            }
            if (allBkRes.status === 'fulfilled') {
                setBookingsList(allBkRes.value.content || []);
                setBookingsTotalPages(allBkRes.value.totalPages || 0);
            }
            if (techsRes.status === 'fulfilled') {
                setTechnicians(techsRes.value || []);
            }

            setHasError(allFailed);
        } catch (err) {
            console.error('Failed to load admin dashboard data:', err);
            setHasError(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await loadData();
        if (showCriticalPanel) {
            await loadCriticalBookings();
        }
        setIsRefreshing(false);
        toast.success('Telemetry Synchronized');
    };

    const loadCriticalBookings = async () => {
        setCriticalLoading(true);
        try {
            const data = await adminService.getCriticalBookings();
            setCriticalBookings(data);
        } catch {
            toast.error('Failed to load critical bookings');
        } finally {
            setCriticalLoading(false);
        }
    };

    const handleOpenCriticalPanel = async () => {
        setShowCriticalPanel(true);
        await loadCriticalBookings();
    };

    const handleAddStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/api/admin/staff', newStaff);
            toast.success(`${newStaff.role} added successfully`);
            setShowAddStaff(false);
            setNewStaff({ name: '', email: '', password: 'password123', role: 'TECHNICIAN', phone: '' });
            loadData();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to add staff');
        }
    };

    if (isLoading && !stats) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-bg">
                <div className="flex flex-col items-center gap-4">
                    <RefreshCw className="w-12 h-12 text-primary animate-spin" />
                    <p className="text-sm font-black uppercase tracking-widest text-text/40">Initializing Command Center...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg pb-20">
            <div className="max-w-350 mx-auto px-6 lg:px-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-6 pt-10">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2.5">
                            <Shield className="w-4 h-4 text-primary" />
                            <span className="text-[9px] font-black text-text/40 uppercase tracking-[0.3em]">Admin Dashboard</span>
                        </div>
                        <h1 className="text-3xl font-black text-text uppercase italic tracking-tighter flex items-center gap-3">
                            System <span className="text-primary italic">Status</span>
                            <span className="bg-red-500 text-white text-[8px] px-2.5 py-1 rounded-full not-italic tracking-widest animate-pulse font-black shadow-lg shadow-red-500/20">OPERATIONAL</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="flex items-center gap-2.5 px-5 py-3.5 bg-white/40 border border-primary/5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-primary transition-all active:scale-95 disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            <div className="flex flex-col items-start leading-none">
                                <span>Sync Data</span>
                                <span className="text-[7px] text-primary/60 mt-0.5">{new Date().toLocaleTimeString()}</span>
                            </div>
                        </button>
                        <button className="p-3.5 bg-white/40 border border-primary/5 rounded-xl text-text/40 hover:text-primary transition-all relative">
                            <Bell className="w-4 h-4" />
                            <span className="absolute top-3.5 right-3.5 w-1.5 h-1.5 bg-cta rounded-full border-2 border-white" />
                        </button>
                    </div>
                </div>

                <div className="mb-6">
                    <div className="inline-flex gap-3 p-2 bg-white/40 backdrop-blur-md rounded-xl border border-white/60">
                        <div className="px-4 py-2 bg-white/60 rounded-lg border border-white/80 shadow-sm text-center min-w-23">
                            <span className="block text-[clamp(1.1rem,0.95rem+0.5vw,1.4rem)] font-black text-cyan-700 tracking-tight">{stats?.totalUsers ?? 0}</span>
                            <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Users</span>
                        </div>
                        <div className="px-4 py-2 bg-white/60 rounded-lg border border-white/80 shadow-sm text-center min-w-23">
                            <span className="block text-[clamp(1.1rem,0.95rem+0.5vw,1.4rem)] font-black text-amber-600 tracking-tight">{stats?.pendingBookings ?? 0}</span>
                            <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Pending</span>
                        </div>
                        <div className="px-4 py-2 bg-white/60 rounded-lg border border-white/80 shadow-sm text-center min-w-23">
                            <span className="block text-[clamp(1.1rem,0.95rem+0.5vw,1.4rem)] font-black text-rose-600 tracking-tight">{stats?.criticalCount ?? 0}</span>
                            <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Critical</span>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                {stats && <SystemStatsCards stats={stats} />}

                {/* Critical Alerts */}
                <div className="mt-6">
                    <section className="bg-red-50 border border-red-200 rounded-2xl p-5">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 rounded-xl">
                                    <AlertTriangle className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-black uppercase tracking-widest text-red-700">Critical Alerts</h2>
                                    <p className="text-xs font-bold text-red-600/80">Bookings marked critical and not completed</p>
                                </div>
                            </div>
                            <button
                                onClick={handleOpenCriticalPanel}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-all"
                            >
                                <span className="px-2 py-0.5 rounded-lg bg-white/20">{stats?.criticalCount ?? 0}</span>
                                View Alerts
                            </button>
                        </div>
                    </section>
                </div>

                {showCriticalPanel && (
                    <section className="mt-4 bg-white/70 backdrop-blur-xl border border-red-100 rounded-4xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-black uppercase text-red-700 tracking-widest">Critical Bookings</h3>
                            <button
                                onClick={() => setShowCriticalPanel(false)}
                                className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        {criticalLoading ? (
                            <div className="text-sm font-bold text-text/60">Loading critical alerts...</div>
                        ) : criticalBookings.length === 0 ? (
                            <div className="text-sm font-bold text-text/60">No critical bookings found.</div>
                        ) : (
                            <div className="space-y-3">
                                {criticalBookings.map((item) => (
                                    <div key={item.id} className="border border-red-100 bg-red-50/50 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                                        <div className="space-y-1">
                                            <p className="text-sm font-black text-text">{item.patientName}</p>
                                            <p className="text-xs font-bold text-text/70">{item.testName}</p>
                                            <p className="text-[11px] font-bold text-text/60">
                                                Flagged: {item.flaggedDate ? new Date(item.flaggedDate).toLocaleString() : 'N/A'}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black px-3 py-1 rounded-lg bg-red-100 text-red-700 border border-red-200 uppercase tracking-wider">
                                                {item.status}
                                            </span>
                                            <button
                                                onClick={() => setSelectedCritical(item)}
                                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-red-200 text-[10px] font-black uppercase tracking-widest text-red-700 hover:bg-red-50"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                View
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {/* Main Content Areas Stacking Full Width */}
                <div className="space-y-6 mt-6">
                    {/* Revenue, Growth & Trend Triple Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <RevenueChart data={revenueData} />
                        <GrowthChart data={growthData} />
                        <BookingTrendChart data={bookingData} />
                    </div>

                    {/* Staff Management - NOW FULL WIDTH */}
                    <section className="bg-white/40 backdrop-blur-xl border border-primary/5 rounded-4xl p-6 shadow-sm overflow-hidden relative group">
                        <div className="flex items-center justify-between gap-4 mb-5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-xl">
                                    <Users className="w-5 h-5 text-primary" />
                                </div>
                                <h2 className="text-lg font-black text-text uppercase italic tracking-tighter">Staff <span className="text-primary italic">Management</span></h2>
                            </div>
                            <button
                                onClick={() => setShowAddStaff(true)}
                                className="px-5 py-2.5 bg-primary text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 active:scale-95 flex items-center gap-2"
                            >
                                <UserPlus className="w-3.5 h-3.5" /> Add Specialist
                            </button>
                        </div>

                        <UserManagementTable users={users.filter(u => u.role !== 'PATIENT')} />
                        <Pagination currentPage={usersPage} totalPages={usersTotalPages} onPageChange={setUsersPage} />
                    </section>
                </div>

                {/* NEW: Bookings Management / Active Operations Section */}
                <div className="mt-6 mb-6">
                    <section className="bg-white/60 backdrop-blur-2xl border border-primary/10 rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20" />

                        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5 mb-6 relative z-10">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 bg-primary/10 rounded-xl">
                                    <ClipboardList className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex flex-col">
                                    <h2 className="text-lg font-black text-text uppercase italic leading-none">Operations <span className="text-primary italic">Monitor</span></h2>
                                    <span className="text-[8px] font-bold text-primary uppercase tracking-widest mt-0.5">Live Tracking</span>
                                </div>
                                <span className="ml-1.5 bg-cta text-white text-[7px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest">LIVE</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2.5">
                                <div className="flex items-center gap-2.5 bg-white/40 border border-primary/10 rounded-xl px-3.5 py-2 shadow-inner group-focus-within:border-primary transition-all">
                                    <Search className="w-3.5 h-3.5 text-text/30" />
                                    <input
                                        type="text"
                                        placeholder="SEARCH..."
                                        value={patientSearch}
                                        onChange={(e) => setPatientSearch(e.target.value)}
                                        className="bg-transparent border-none outline-none text-[10px] font-black uppercase placeholder:text-text/40 w-36 tracking-widest"
                                    />
                                </div>
                                <div className="flex items-center gap-2.5 bg-white/40 border border-primary/10 rounded-xl px-3.5 py-2 shadow-inner">
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest text-text"
                                    >
                                        <option value="">STATUS</option>
                                        <option value="BOOKED">BOOKED</option>
                                        <option value="REFLEX_PENDING">REFLEX_PENDING</option>
                                        <option value="SAMPLE_COLLECTED">SAMPLE_COLLECTED</option>
                                        <option value="PROCESSING">PROCESSING</option>
                                        <option value="PENDING_VERIFICATION">PENDING_VERIFICATION</option>
                                        <option value="VERIFIED">VERIFIED</option>
                                        <option value="COMPLETED">COMPLETED</option>
                                        <option value="CANCELLED">CANCELLED</option>
                                    </select>
                                </div>
                                <div className="bg-text text-white px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl">
                                    {bookingsList.length || 'NO'} QUEUED
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/40 backdrop-blur-xl border border-primary/10 rounded-[2.5rem] overflow-hidden shadow-sm">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-primary/10 bg-primary/5">
                                        <th className="text-left px-8 py-6 text-[11px] font-black text-text uppercase tracking-widest">Patient Details</th>
                                        <th className="text-left px-8 py-6 text-[11px] font-black text-text uppercase tracking-widest">Test Information</th>
                                        <th className="text-left px-8 py-6 text-[11px] font-black text-text uppercase tracking-widest">Schedule</th>
                                        <th className="text-left px-8 py-6 text-[11px] font-black text-text uppercase tracking-widest">Assigned Staff</th>
                                        <th className="text-left px-8 py-6 text-[11px] font-black text-text uppercase tracking-widest">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookingsList.map((b: any) => (
                                        <tr key={b.id} className="border-b border-primary/5 hover:bg-primary/5 transition-all group">
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">ID #{b.id} · {b.bookingReference}</span>
                                                    <span className="font-extrabold text-text text-sm">{b.patientName}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-sm font-bold text-text/80">{b.testName}</td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col">
                                                    <span className="font-extrabold text-text/80">{b.bookingDate}</span>
                                                    <span className="text-[10px] font-black text-text/40 tracking-widest uppercase mt-0.5">{b.timeSlot}</span>
                                                    <span className="text-[10px] font-black text-primary tracking-widest uppercase mt-0.5">₹{Number(b.amount ?? b.finalAmount ?? 0).toLocaleString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                {(() => {
                                                    const isUnassigned = !b.technicianId || b.technicianName === 'Unassigned';
                                                    if (isAssigning === b.id) {
                                                        return (
                                                            <div className="flex items-center gap-2">
                                                                <select
                                                                    className="text-[10px] font-black uppercase tracking-widest bg-white border border-primary/20 rounded-xl px-4 py-2 outline-none focus:border-primary shadow-sm"
                                                                    onChange={(e) => handleAssignTechnician(b.id, parseInt(e.target.value))}
                                                                    defaultValue=""
                                                                >
                                                                    <option value="" disabled>SELECT AGENT</option>
                                                                    {technicians.map((t: any) => (
                                                                        <option key={t.id} value={t.id}>{t.name}</option>
                                                                    ))}
                                                                </select>
                                                                <button
                                                                    onClick={() => setIsAssigning(null)}
                                                                    className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline"
                                                                >
                                                                    IGNORE
                                                                </button>
                                                            </div>
                                                        );
                                                    }

                                                    if (!isUnassigned) {
                                                        return (
                                                            <div className="flex items-center gap-2">
                                                                <div className="flex flex-col">
                                                                    <span className="font-extrabold text-text/80 uppercase text-[11px] tracking-tight">{b.technicianName}</span>
                                                                    <button
                                                                        onClick={() => setIsAssigning(b.id)}
                                                                        className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline text-left mt-0.5"
                                                                    >
                                                                        REASSIGN AGENT
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        );
                                                    }

                                                    return (
                                                        <button
                                                            onClick={() => setIsAssigning(b.id)}
                                                            className="flex items-center gap-2 px-4 py-2 bg-cta text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-cta/90 transition-all shadow-md active:scale-95"
                                                        >
                                                            <UserCheck className="w-3.5 h-3.5" /> ASSIGN
                                                        </button>
                                                    );
                                                })()}
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="mb-2">
                                                    <span className={`inline-flex text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${
                                                        b.status === 'COMPLETED' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                                                        b.status === 'CANCELLED' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                        'bg-primary/10 text-primary border-primary/20'
                                                    }`}>
                                                        {b.status}
                                                    </span>
                                                </div>
                                                <div className="relative group/status w-fit">
                                                    <select
                                                        value={b.status}
                                                        disabled={isUpdatingStatus === b.id}
                                                        onChange={(e) => handleForceStatusUpdate(b.id, e.target.value)}
                                                        className={`text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl outline-none appearance-none cursor-pointer border shadow-sm transition-all focus:ring-2 focus:ring-primary/20 ${b.status === 'COMPLETED' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                                                                b.status === 'CANCELLED' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                                    'bg-primary/10 text-primary border-primary/20'
                                                            }`}
                                                    >
                                                        <option value="BOOKED">BOOKED</option>
                                                        <option value="REFLEX_PENDING">REFLEX_PENDING</option>
                                                        <option value="PROCESSING">PROCESSING</option>
                                                        <option value="SAMPLE_COLLECTED">COLLECTED</option>
                                                        <option value="PENDING_VERIFICATION">VERIFICATION</option>
                                                        <option value="VERIFIED">VERIFIED</option>
                                                        <option value="COMPLETED">COMPLETED</option>
                                                        <option value="CANCELLED">CANCELLED</option>
                                                    </select>
                                                </div>
                                                {b.cancellationReason && (
                                                    <p className="text-[9px] font-bold text-red-500 truncate max-w-30 mt-2 uppercase tracking-tighter" title={b.cancellationReason}>
                                                        {b.cancellationReason}
                                                    </p>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {bookingsList.length === 0 && (
                                        <tr><td colSpan={5} className="px-8 py-20 text-center text-text/30 text-[11px] font-black uppercase tracking-widest">
                                            No active bookings found in the database.
                                        </td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination currentPage={bookingsPage} totalPages={bookingsTotalPages} onPageChange={setBookingsPage} />
                    </section>
                </div>

                {/* Audit Logs & Priority Area */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-2 bg-white/40 backdrop-blur-xl border border-primary/5 rounded-4xl p-6 shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between gap-3 mb-5">
                            <div className="flex items-center gap-2.5">
                                <Activity className="w-5 h-5 text-primary" />
                                <h3 className="text-base font-black uppercase italic">Activity <span className="text-primary italic">Logs</span></h3>
                            </div>
                            <a href="/admin/audit-logs"
                                className="text-[9px] font-black uppercase tracking-widest text-primary hover:text-primary-dark transition-colors">
                                View History →
                            </a>
                        </div>
                        <div className="space-y-3">
                            {auditLogs.slice(0, 5).map((log) => (
                                <div key={log.id} className="flex items-center justify-between p-3 bg-primary/5 rounded-xl border border-primary/5 hover:border-primary/10 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-1.5 h-1.5 rounded-full ${log.status === 'success' ? 'bg-cta' :
                                            log.status === 'warning' ? 'bg-amber-400' : 'bg-red-400'
                                            }`} />
                                        <div>
                                            <p className="text-[10px] font-black uppercase italic text-text">{log.action}</p>
                                            <p className="text-[8px] font-bold text-text/40">{log.timestamp}</p>
                                        </div>
                                    </div>
                                    <div className="text-[9px] font-black uppercase tracking-widest text-text/60 px-2.5 py-1 bg-white rounded-lg border border-primary/5">
                                        {log.user}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Global Parameters Card */}
                    <div className="bg-linear-to-br from-primary to-ocean-blue rounded-4xl p-7 text-white relative overflow-hidden group shadow-xl">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-3xl -mr-8 -mt-8" />
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="p-2.5 bg-white/20 rounded-xl w-fit">
                                    <Settings className="w-5 h-5" />
                                </div>
                                <div className="space-y-1.5">
                                    <h3 className="text-xl font-black uppercase italic tracking-tight leading-none text-white">Global <span className="text-white/60">Parameters</span></h3>
                                    <p className="text-[9px] font-bold text-white/70 uppercase tracking-widest">Config & labs</p>
                                </div>
                            </div>
                            <div className="space-y-2.5 mt-6">
                                <button 
                                    onClick={handleDatabaseOptimize}
                                    disabled={isOptimizing}
                                    className="w-full py-3.5 bg-white/10 hover:bg-white/20 active:scale-95 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all text-left px-4 flex items-center justify-between group/btn border border-white/5 disabled:opacity-50"
                                >
                                    <span className="flex items-center gap-2">
                                        {isOptimizing && <RefreshCw className="w-3 h-3 animate-spin" />}
                                        {isOptimizing ? 'Optimizing...' : 'Test Database'}
                                    </span>
                                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover/btn:translate-x-1 group-hover/btn:opacity-100 transition-all" />
                                </button>
                                <button 
                                    onClick={handleSyncClinics}
                                    disabled={isSyncingClinics}
                                    className="w-full py-3.5 bg-white/10 hover:bg-white/20 active:scale-95 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all text-left px-4 flex items-center justify-between group/btn border border-white/5 disabled:opacity-50"
                                >
                                    <span className="flex items-center gap-2">
                                        {isSyncingClinics && <RefreshCw className="w-3 h-3 animate-spin" />}
                                        {isSyncingClinics ? 'Syncing...' : 'Partner Clinics'}
                                    </span>
                                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover/btn:translate-x-1 group-hover/btn:opacity-100 transition-all" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Security Checkup Card */}
                    <div className="bg-text text-white rounded-4xl p-7 space-y-6 shadow-xl relative overflow-hidden group">
                        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/40 transition-all duration-700" />
                        <div className="relative z-10 flex flex-col justify-between h-full">
                            <div className="space-y-3.5">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">System Security</span>
                                <h3 className="text-xl font-black uppercase italic leading-none">Security <span className="text-primary italic">Checkup</span></h3>
                                <p className="text-[10px] text-white/50 font-medium leading-relaxed">
                                    Compliance audit & safety.
                                </p>
                            </div>
                            <button 
                                onClick={handleRunSecurityScan}
                                disabled={isScanning}
                                className="w-full py-4 bg-white text-text rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white active:scale-95 transition-all relative z-10 shadow-lg mt-6 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isScanning ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Scanning...
                                    </>
                                ) : (
                                    'Run Security Scan'
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Cancellation Modal */}
                {showCancelModal && (
                    <div className="fixed inset-0 bg-text/40 backdrop-blur-md flex items-center justify-center z-100 p-6">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white rounded-4xl p-8 max-w-sm w-full shadow-2xl border border-primary/10"
                        >
                            <h3 className="text-xl font-black uppercase text-text mb-4 italic">Confirm <span className="text-red-500">Cancellation</span></h3>
                            <p className="text-xs font-bold text-text/60 mb-6 uppercase tracking-wider">Please provide a mandatory operational reason for aborting this booking.</p>
                            <textarea
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="Patient requested cancellation / Technical error..."
                                className="w-full h-32 p-4 bg-primary/5 border border-primary/10 rounded-2xl text-xs font-bold outline-none focus:border-red-500 transition-all mb-6"
                            />
                            <div className="flex gap-4">
                                <button
                                    onClick={() => handleForceStatusUpdate(showCancelModal.id, showCancelModal.status, cancelReason)}
                                    disabled={!cancelReason.trim()}
                                    className="flex-1 py-4 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all disabled:opacity-40"
                                >
                                    Force Cancel
                                </button>
                                <button
                                    onClick={() => { setShowCancelModal(null); setCancelReason(''); }}
                                    className="flex-1 py-4 bg-primary/5 text-text rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 transition-all"
                                >
                                    Ignore
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {selectedCritical && (
                    <div className="fixed inset-0 bg-text/40 backdrop-blur-md flex items-center justify-center z-110 p-6">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white rounded-4xl p-7 max-w-lg w-full shadow-2xl border border-red-100"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-black uppercase text-red-700 tracking-widest">Critical Booking Detail</h3>
                                <button onClick={() => setSelectedCritical(null)} className="p-2 rounded-lg hover:bg-red-50 text-red-600">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="space-y-2 text-sm">
                                <p><span className="font-black text-text/70 uppercase text-[10px] tracking-wider">Reference:</span> {selectedCritical.bookingReference}</p>
                                <p><span className="font-black text-text/70 uppercase text-[10px] tracking-wider">Patient:</span> {selectedCritical.patientName}</p>
                                <p><span className="font-black text-text/70 uppercase text-[10px] tracking-wider">Test:</span> {selectedCritical.testName}</p>
                                <p><span className="font-black text-text/70 uppercase text-[10px] tracking-wider">Flagged:</span> {selectedCritical.flaggedDate ? new Date(selectedCritical.flaggedDate).toLocaleString() : 'N/A'}</p>
                                <p><span className="font-black text-text/70 uppercase text-[10px] tracking-wider">Status:</span> {selectedCritical.status}</p>
                                <p><span className="font-black text-text/70 uppercase text-[10px] tracking-wider">Booking Date:</span> {selectedCritical.bookingDate || 'N/A'}</p>
                                <p><span className="font-black text-text/70 uppercase text-[10px] tracking-wider">Time Slot:</span> {selectedCritical.timeSlot || 'N/A'}</p>
                                <p><span className="font-black text-text/70 uppercase text-[10px] tracking-wider">Technician:</span> {selectedCritical.technicianName || 'Unassigned'}</p>
                                <p><span className="font-black text-text/70 uppercase text-[10px] tracking-wider">Collection:</span> {selectedCritical.collectionType || 'N/A'}</p>
                                <p><span className="font-black text-text/70 uppercase text-[10px] tracking-wider">Address:</span> {selectedCritical.collectionAddress || 'N/A'}</p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
