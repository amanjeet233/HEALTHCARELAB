import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Activity, Settings, Bell, UserPlus, Trash2 } from 'lucide-react';
import SystemStatsCards from '../../components/admin/SystemStatsCards';
import UserManagementTable from '../../components/admin/UserManagementTable';
import GrowthChart from '../../components/admin/charts/GrowthChart';
import RevenueChart from '../../components/admin/charts/RevenueChart';
import BookingTrendChart from '../../components/admin/charts/BookingTrendChart';
import { adminService, type SystemStats, type User, type ChartDataPoint, type AuditLog } from '../../services/adminService';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { notify } from '../../utils/toast';

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<SystemStats | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [growthData, setGrowthData] = useState<ChartDataPoint[]>([]);
    const [revenueData, setRevenueData] = useState<ChartDataPoint[]>([]);
    const [bookingData, setBookingData] = useState<ChartDataPoint[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [staff, setStaff] = useState<any[]>([]);
    const [showAddStaff, setShowAddStaff] = useState(false);
    const [newStaff, setNewStaff] = useState({
        name: '', email: '', password: 'password123',
        role: 'TECHNICIAN', phone: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        setHasError(false);
        try {
            const [statsData, usersData, growth, revenue, bookings, logs] = await Promise.all([
                adminService.getSystemStats(),
                adminService.getAllUsers(),
                adminService.getChartData('growth'),
                adminService.getChartData('revenue'),
                adminService.getChartData('bookings'),
                adminService.getAuditLogs()
            ]);
            setStats(statsData);
            setUsers(usersData);
            setGrowthData(growth);
            setRevenueData(revenue);
            setBookingData(bookings);
            setAuditLogs(logs);

            // Fetch staff list
            try {
                const staffRes = await api.get('/api/admin/staff');
                setStaff(staffRes.data?.data || []);
            } catch { setStaff([]); }
        } catch (error) {
            setHasError(true);
            notify.error('Admin telemetry acquisition failed.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full relative"
                >
                    <Shield className="absolute inset-0 m-auto w-6 h-6 text-primary animate-pulse" />
                </motion.div>
            </div>
        );
    }

    if (hasError) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
                <Shield className="w-16 h-16 text-red-500 mb-4 opacity-80" />
                <h2 className="text-2xl font-black uppercase text-text mb-2">Telemetry Offline</h2>
                <p className="text-muted-gray mb-6 max-w-md">Failed to acquire secure uplink with administrative services. Please verify node connectivity.</p>
                <button 
                    onClick={loadData}
                    className="px-8 py-3 bg-primary text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-primary-dark transition-colors"
                >
                    Retry Connection
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Admin HUD Header */}
            <div className="bg-white/40 backdrop-blur-3xl border-b border-primary/5 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-primary" />
                            <span className="text-[10px] font-black text-text/40 uppercase tracking-[0.3em]">Command Center Node: 0xAdmin</span>
                        </div>
                        <h1 className="text-4xl font-black text-text uppercase italic tracking-tighter">
                            System <span className="text-primary italic">Intelligence</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-4 bg-white/40 border border-primary/5 rounded-2xl text-text/40 hover:text-primary transition-all relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-3 right-3 w-2 h-2 bg-cta rounded-full" />
                        </button>
                        <button className="flex items-center gap-3 px-6 py-4 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                            <Settings className="w-5 h-5" />
                            <span className="text-[11px] font-black uppercase tracking-widest">Protocol Config</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 pt-12 space-y-12">
                {/* Stats Grid */}
                {stats && <SystemStatsCards stats={stats} />}

                {/* Intelligence Charts Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="bg-white/40 backdrop-blur-xl border border-primary/5 rounded-[2.5rem] p-8 shadow-sm">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-text/60">Registry Growth</h3>
                            <div className="text-[10px] font-black italic text-primary">+34% vs last month</div>
                        </div>
                        <GrowthChart data={growthData} />
                    </div>
                    <div className="bg-white/40 backdrop-blur-xl border border-primary/5 rounded-[2.5rem] p-8 shadow-sm">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-text/60">Revenue Synthesis</h3>
                            <div className="text-[10px] font-black italic text-cta">Optimized</div>
                        </div>
                        <RevenueChart data={revenueData} />
                    </div>
                    <div className="bg-white/40 backdrop-blur-xl border border-primary/5 rounded-[2.5rem] p-8 shadow-sm">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-text/60">Booking Trends</h3>
                            <div className="text-[10px] font-black italic text-secondary">Stabilized</div>
                        </div>
                        <BookingTrendChart data={bookingData} />
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 gap-12">
                    <section className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <Users className="w-6 h-6 text-primary" />
                                <h2 className="text-xl font-black text-text uppercase italic">Neural <span className="text-primary italic">Registry</span></h2>
                            </div>
                            <div className="bg-cta/10 text-cta px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-cta/10">
                                {users.length} Nodes Online
                            </div>
                        </div>

                        <UserManagementTable users={users} />
                    </section>

                    {/* ── Staff Management ─────────────────────── */}
                    <section className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <UserPlus className="w-6 h-6 text-primary" />
                                <h2 className="text-xl font-black text-text uppercase italic">Staff <span className="text-primary italic">Management</span></h2>
                            </div>
                            <button
                                onClick={() => setShowAddStaff(true)}
                                className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
                            >
                                <UserPlus className="w-4 h-4" /> Add Staff
                            </button>
                        </div>

                        {/* Add Staff Form */}
                        {showAddStaff && (
                            <div className="bg-white/60 backdrop-blur-xl border border-primary/10 rounded-[2rem] p-8 shadow-sm">
                                <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-text/60 mb-6">Create Staff Account</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text/40 block mb-2">Full Name</label>
                                        <input value={newStaff.name}
                                            onChange={e => setNewStaff(p => ({...p, name: e.target.value}))}
                                            placeholder="Dr. Sharma"
                                            className="w-full px-4 py-3 bg-white border border-primary/10 rounded-xl text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text/40 block mb-2">Email</label>
                                        <input value={newStaff.email}
                                            onChange={e => setNewStaff(p => ({...p, email: e.target.value}))}
                                            placeholder="doctor@hospital.com"
                                            className="w-full px-4 py-3 bg-white border border-primary/10 rounded-xl text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text/40 block mb-2">Phone</label>
                                        <input value={newStaff.phone}
                                            onChange={e => setNewStaff(p => ({...p, phone: e.target.value}))}
                                            placeholder="9876543210"
                                            className="w-full px-4 py-3 bg-white border border-primary/10 rounded-xl text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text/40 block mb-2">Password</label>
                                        <input value={newStaff.password}
                                            onChange={e => setNewStaff(p => ({...p, password: e.target.value}))}
                                            className="w-full px-4 py-3 bg-white border border-primary/10 rounded-xl text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text/40 block mb-2">Role</label>
                                        <select value={newStaff.role}
                                            onChange={e => setNewStaff(p => ({...p, role: e.target.value}))}
                                            className="w-full px-4 py-3 bg-white border border-primary/10 rounded-xl text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all">
                                            <option value="TECHNICIAN">Technician</option>
                                            <option value="MEDICAL_OFFICER">Medical Officer</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={async () => {
                                        try {
                                            await api.post('/api/admin/staff', newStaff);
                                            toast.success('Staff account created!');
                                            setShowAddStaff(false);
                                            setNewStaff({ name:'', email:'', password:'password123', role:'TECHNICIAN', phone:'' });
                                            loadData();
                                        } catch (err: any) {
                                            toast.error(err.response?.data?.message || 'Failed to create staff');
                                        }
                                    }}
                                        className="px-6 py-3 bg-primary text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-primary-dark transition-all shadow-lg shadow-primary/20">
                                        Create Account
                                    </button>
                                    <button onClick={() => setShowAddStaff(false)}
                                        className="px-6 py-3 bg-primary/5 text-text rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-primary/10 transition-all">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Staff List Table */}
                        <div className="bg-white/40 backdrop-blur-xl border border-primary/5 rounded-[2.5rem] overflow-hidden shadow-sm">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-primary/5">
                                        <th className="text-left px-6 py-4 text-[10px] font-black text-text/40 uppercase tracking-[0.2em]">Name</th>
                                        <th className="text-left px-6 py-4 text-[10px] font-black text-text/40 uppercase tracking-[0.2em]">Email</th>
                                        <th className="text-left px-6 py-4 text-[10px] font-black text-text/40 uppercase tracking-[0.2em]">Role</th>
                                        <th className="text-left px-6 py-4 text-[10px] font-black text-text/40 uppercase tracking-[0.2em]">Status</th>
                                        <th className="text-right px-6 py-4 text-[10px] font-black text-text/40 uppercase tracking-[0.2em]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {staff.map((s: any) => (
                                        <tr key={s.id} className="border-b border-primary/5 hover:bg-primary/5 transition-colors">
                                            <td className="px-6 py-4 font-bold text-text">{s.name}</td>
                                            <td className="px-6 py-4 text-text/60">{s.email}</td>
                                            <td className="px-6 py-4">
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                                                    s.role === 'MEDICAL_OFFICER' ? 'bg-teal-500/10 text-teal-600' :
                                                    s.role === 'TECHNICIAN' ? 'bg-blue-500/10 text-blue-600' :
                                                    'bg-red-500/10 text-red-600'}`}>
                                                    {s.role === 'MEDICAL_OFFICER' ? 'Medical Officer' :
                                                     s.role === 'TECHNICIAN' ? 'Technician' : s.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                                                    s.isActive ? 'bg-cta/10 text-cta' : 'bg-red-500/10 text-red-500'}`}>
                                                    {s.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {s.role !== 'ADMIN' && (
                                                    <button onClick={async () => {
                                                        if (!confirm(`Remove ${s.name} (${s.role})?`)) return;
                                                        try {
                                                            await api.delete(`/api/admin/staff/${s.id}`);
                                                            toast.success('Staff removed');
                                                            loadData();
                                                        } catch {
                                                            toast.error('Failed to remove staff');
                                                        }
                                                    }}
                                                        className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-700 px-3 py-1.5 hover:bg-red-50 rounded-lg transition-colors ml-auto">
                                                        <Trash2 className="w-3 h-3" /> Remove
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {staff.length === 0 && (
                                        <tr><td colSpan={5} className="px-6 py-12 text-center text-text/30 text-sm font-medium">
                                            No staff accounts yet. Click "Add Staff" to create one.
                                        </td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>

                {/* Audit Logs & Priority Area */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 bg-white/40 backdrop-blur-xl border border-primary/5 rounded-[3rem] p-10 shadow-sm overflow-hidden">
                        <div className="flex items-center gap-3 mb-8">
                            <Activity className="w-6 h-6 text-primary" />
                            <h3 className="text-lg font-black uppercase italic">System <span className="text-primary italic">Audit Log</span></h3>
                        </div>
                        <div className="space-y-4">
                            {auditLogs.map((log) => (
                                <div key={log.id} className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl border border-primary/5 hover:border-primary/10 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-2 h-2 rounded-full ${log.status === 'success' ? 'bg-cta' :
                                                log.status === 'warning' ? 'bg-amber-400' : 'bg-red-400'
                                            }`} />
                                        <div>
                                            <p className="text-[11px] font-black uppercase italic text-text">{log.action}</p>
                                            <p className="text-[9px] font-bold text-text/40">{log.timestamp}</p>
                                        </div>
                                    </div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-text/60 px-3 py-1 bg-white rounded-lg border border-primary/5">
                                        {log.user}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-text text-white rounded-[3rem] p-10 space-y-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/40 transition-all duration-700" />
                        <div className="relative z-10 space-y-4">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Priority Alert</span>
                            <h3 className="text-2xl font-black uppercase italic leading-none">Security <span className="text-primary italic">Protocol Audit</span></h3>
                            <p className="text-[11px] text-white/50 font-medium leading-relaxed">
                                System wide audit required for encryption nodes across the European medical grid.
                            </p>
                        </div>
                        <button className="w-full py-5 bg-white text-text rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all relative z-10 shadow-xl">
                            Initialize Audit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
