import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Activity, Settings, Bell } from 'lucide-react';
import SystemStatsCards from '../../components/admin/SystemStatsCards';
import UserManagementTable from '../../components/admin/UserManagementTable';
import GrowthChart from '../../components/admin/charts/GrowthChart';
import RevenueChart from '../../components/admin/charts/RevenueChart';
import BookingTrendChart from '../../components/admin/charts/BookingTrendChart';
import { adminService, type SystemStats, type User, type ChartDataPoint, type AuditLog } from '../../services/adminService';
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
