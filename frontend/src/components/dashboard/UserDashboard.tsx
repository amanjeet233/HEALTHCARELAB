import React, { useEffect, useState } from 'react';
import { FaCalendarAlt, FaClipboardList, FaCheckCircle, FaHourglassHalf, FaFlask, FaChevronRight } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { bookingService } from '../../services/booking';
import { doctorService } from '../../services/doctorService';
import { technicianService, getTechnicianBookings } from '../../services/technicianService';
import type { BookingResponse } from '../../types/booking';
import Card from '../common/Card';
import { useModal } from '../../context/ModalContext';
import ReportUploadModal from '../reports/ReportUploadModal';
import { notify } from '../../utils/toast';
import DashboardStatCard from './DashboardStatCard';
import ActivityCard from './ActivityCard';

const UserDashboard: React.FC = () => {
    const { openModal } = useModal();
    const { currentUser, isAuthenticated } = useAuth();
    const [bookings, setBookings] = useState<BookingResponse[]>([]);
    const [stats, setStats] = useState<Record<string, number> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadBookingId, setUploadBookingId] = useState<number | null>(null);

    const fetchData = async () => {
        if (!isAuthenticated) return;
        setIsLoading(true);
        setError(null);
        try {
            if (currentUser?.role === 'PATIENT') {
                const response = await bookingService.getMyBookings({ size: 5, sort: 'bookingDate,desc' });
                setBookings(response.bookings || []);
                setStats({
                    upcoming: response.bookings.filter(b => b.status === 'PENDING' || b.status === 'CONFIRMED').length,
                    completed: response.bookings.filter(b => b.status === 'COMPLETED' || b.status === 'SAMPLE_COLLECTED').length,
                    reports: response.bookings.filter(b => b.status === 'COMPLETED').length
                });
            } else if (currentUser?.role === 'MEDICAL_OFFICER') {
                try {
                    const [statsData, pendingResponse] = await Promise.all([
                        doctorService.getDashboardStats(),
                        doctorService.getPendingRequests()
                    ]);
                    setStats(statsData);
                    const bookingsData = pendingResponse.data?.content || pendingResponse.data || [];
                    setBookings(Array.isArray(bookingsData) ? bookingsData : []);
                } catch (error) {
                    console.error("Failed to fetch pending requests:", error);
                    setBookings([]);
                }
            } else if (currentUser?.role === 'TECHNICIAN') {
                const [statsData, collectionsResponse] = await Promise.all([
                    technicianService.getDashboardStats(),
                    getTechnicianBookings()
                ]);
                setStats(statsData);
                const collectionsData = collectionsResponse.data.data || collectionsResponse.data;
                setBookings(collectionsData || []);
            }
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
            setError("Failed to load dashboard data. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [isAuthenticated, currentUser]);

    const handleOpenUploadModal = (bookingId: number) => {
        setUploadBookingId(bookingId);
        setShowUploadModal(true);
    };

    const handleMarkCollected = async (bookingId: number) => {
        try {
            await technicianService.updateCollectionStatus(bookingId);
            notify.success('Sample collection marked as complete.');
            await fetchData();
        } catch (error) {
            console.error('Error marking collection:', error);
            notify.error('Failed to mark sample as collected.');
        }
    };

    const handleVerifyReport = async (bookingId: number) => {
        try {
            await doctorService.verifyReport(bookingId);
            notify.success('Report verified successfully!');
            await fetchData();
        } catch (error) {
            console.error('Error verifying report:', error);
            notify.error('Failed to verify report.');
        }
    };

    const handleUploadSuccess = async () => {
        if (!uploadBookingId) return;

        try {
            await technicianService.updateBookingCompletedStatus(uploadBookingId);
            notify.success('Booking marked as COMPLETED.');
            await fetchData();
        } catch (statusError) {
            console.error(statusError);
            notify.error('Report uploaded but failed to update booking status.');
        } finally {
            setShowUploadModal(false);
            setUploadBookingId(null);
        }
    };

    if (!isAuthenticated) return null;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[400px] text-red-500">
                <FaCheckCircle className="text-4xl mb-4 opacity-50" />
                <p className="font-semibold">{error}</p>
                <button 
                    onClick={() => window.location.reload()} 
                    className="mt-4 px-4 py-2 border rounded-xl border-red-200 hover:bg-red-50 transition-colors text-sm"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <section className="py-12 px-6 max-w-7xl mx-auto w-full">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Stats Grid - Enhanced with standardized colors */}
                <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6 mb-4">
                    {currentUser?.role === 'PATIENT' && (
                        <>
                            <DashboardStatCard
                                icon={<FaCalendarAlt />}
                                label="Upcoming"
                                value={stats?.upcoming || 0}
                                color="#2FA4A9" // Medical Teal
                            />
                            <DashboardStatCard
                                icon={<FaCheckCircle />}
                                label="Completed"
                                value={stats?.completed || 0}
                                color="#10B981" // Success Emerald
                            />
                            <DashboardStatCard
                                icon={<FaClipboardList />}
                                label="Reports Ready"
                                value={stats?.reports || 0}
                                color="#8B0000" // Blood Red
                            />
                        </>
                    )}
                    {currentUser?.role === 'MEDICAL_OFFICER' && (
                        <>
                            <DashboardStatCard
                                icon={<FaHourglassHalf />}
                                label="Pending"
                                value={stats?.pendingCount || 0}
                                color="#2FA4A9"
                            />
                            <DashboardStatCard
                                icon={<FaClipboardList />}
                                label="Today's Tests"
                                value={stats?.todayBookings || 0}
                                color="#8B0000"
                            />
                            <DashboardStatCard
                                icon={<FaCheckCircle />}
                                label="Completed"
                                value={stats?.completedTests || 0}
                                color="#10B981"
                            />
                        </>
                    )}
                    {currentUser?.role === 'TECHNICIAN' && (
                        <>
                            <DashboardStatCard
                                icon={<FaCalendarAlt />}
                                label="Today's Collections"
                                value={stats?.todayCollections || 0}
                                color="#2FA4A9"
                            />
                            <DashboardStatCard
                                icon={<FaHourglassHalf />}
                                label="Pending"
                                value={stats?.pendingCollections || 0}
                                color="#8B0000"
                            />
                            <DashboardStatCard
                                icon={<FaCheckCircle />}
                                label="Completed Today"
                                value={stats?.completedToday || 0}
                                color="#10B981"
                            />
                        </>
                    )}
                </div>

                {/* Main Activity Area - Modernized Feed */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xl md:text-2xl font-black text-ever-green uppercase tracking-tighter italic">
                            {currentUser?.role === 'PATIENT' ? 'NEURAL ACTIVITY' : 'REQUIRES ATTENTION'}
                        </h2>
                        <button className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-teal hover:text-ever-green transition-colors">History &rarr;</button>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {bookings.length > 0 ? (
                            bookings.map((booking) => (
                                <ActivityCard
                                    key={booking.id}
                                    booking={booking}
                                    role={currentUser?.role}
                                    onUploadReport={handleOpenUploadModal}
                                    onMarkCollected={handleMarkCollected}
                                    onVerify={handleVerifyReport}
                                />
                            ))
                        ) : (
                            <div className="text-center py-24 bg-white/30 backdrop-blur-sm rounded-[2.5rem] border border-dashed border-primary-teal/20">
                                <p className="text-[10px] font-black uppercase text-muted-gray opacity-40 tracking-widest">No recent neural link activity</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar / Health Insights - Pro Max Glassmorphism */}
                <div className="space-y-6">
                    <h2 className="text-xl font-black text-ever-green uppercase tracking-tighter italic px-2">BIO-INTELLIGENCE</h2>
                    <Card className="bg-ever-green border-none shadow-radical p-0 overflow-hidden relative group">
                        {/* Animated Gradient Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-teal/20 to-transparent pointer-events-none" />

                        <div className="p-8 relative z-10 space-y-5">
                            <div className="flex items-center space-x-3">
                                <span className="w-2 h-2 bg-secondary rounded-full animate-pulse shadow-[0_0_10px_rgba(255,215,0,0.5)]" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary">Pulse AI Analysis</span>
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-2xl font-black leading-none uppercase italic text-white tracking-tighter">VITALITY INDEX</h3>
                                <div className="text-5xl font-black text-secondary tracking-tighter">88<span className="text-lg opacity-40 ml-1">/100</span></div>
                            </div>

                            <p className="text-[11px] font-bold text-surgical-white/70 leading-relaxed uppercase tracking-wider">
                                Metabolic markers indicate a <span className="text-secondary">15% efficiency surge</span>. Precision optimization recommended via localized protein nodes.
                            </p>

                            <button
                                onClick={() => openModal('REPORT_VIEWER')}
                                className="w-full py-4 bg-white/10 backdrop-blur-md rounded-xl text-[10px] font-black uppercase tracking-widest text-white border border-white/10 hover:bg-white/20 transition-all text-center"
                            >
                                EXPLORE INSIGHTS &rarr;
                            </button>
                        </div>

                        {/* Visual Ornament */}
                        <div className="absolute -bottom-10 -right-10 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-700">
                            <FaFlask className="text-9xl text-white" />
                        </div>
                    </Card>

                    {/* Recommendations - Clean List */}
                    <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] p-8 border border-primary-teal/5 space-y-6 shadow-sm">
                        <div className="flex items-center justify-between border-b border-primary-teal/10 pb-4">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-ever-green opacity-40">Next Actions</h4>
                            <span className="px-3 py-1 bg-primary-teal/10 text-primary-teal rounded-full text-[9px] font-black uppercase tracking-widest">Priority</span>
                        </div>
                        <div className="space-y-3">
                            {[
                                { title: 'Vitamin D3 (60K IU)', reason: 'Low exposure detected', icon: <FaFlask /> },
                                { title: 'Advanced Lipid Profile', reason: 'Due in 14 days', icon: <FaFlask /> },
                                { title: 'Hydration Focus', reason: 'AI Insight', icon: <FaHourglassHalf /> }
                            ].map((rec, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between p-4 bg-white/60 rounded-2xl border border-transparent hover:border-primary-teal/20 hover:bg-white transition-all cursor-pointer group"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 rounded-xl bg-primary-teal/5 flex items-center justify-center text-primary-teal group-hover:bg-primary-teal group-hover:text-white transition-all shadow-inner">
                                            {rec.icon}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-black uppercase tracking-wider text-ever-green">{rec.title}</span>
                                            <span className="text-[10px] font-bold text-muted-gray uppercase opacity-60 tracking-tight">{rec.reason}</span>
                                        </div>
                                    </div>
                                    <FaChevronRight className="text-primary-teal w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-all" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <ReportUploadModal
                isOpen={showUploadModal}
                initialBookingId={uploadBookingId || undefined}
                onClose={() => {
                    setShowUploadModal(false);
                    setUploadBookingId(null);
                }}
                onSuccess={handleUploadSuccess}
            />
        </section>
    );
};

export default UserDashboard;

