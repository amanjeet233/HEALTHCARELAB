import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingService } from '../services/booking';
import type { BookingResponse } from '../types/booking';
import { FaCalendarCheck, FaCalendarAlt, FaClock, FaFlask, FaSearch } from 'react-icons/fa';
import Card from '../components/common/Card';
import StatusBadge from '../components/common/StatusBadge';
import ConfirmationModal from '../components/common/ConfirmationModal';
import BookingActions from '../components/BookingActions';
import { notify } from '../utils/toast';
import './MyBookingsPage.css';

const TABS = ['All', 'Pending', 'Confirmed', 'Sample_Collected', 'Completed', 'Cancelled'];

const MyBookingsPage: React.FC = () => {
    const navigate = useNavigate();

    // Data States
    const [bookings, setBookings] = useState<BookingResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);

    // Filter States
    const [activeTab, setActiveTab] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [page, setPage] = useState(0);

    // Modal State
    const [cancelModalVisible, setCancelModalVisible] = useState(false);
    const [bookingToCancel, setBookingToCancel] = useState<number | null>(null);
    const [isCanceling, setIsCanceling] = useState(false);

    // Debouncer hook
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(0);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    // Fetch Bookings
    useEffect(() => {
        const fetchBookings = async () => {
            setIsLoading(true);
            try {
                const params: Record<string, string | number> = {
                    page: page,
                    size: 10,
                    sort: 'bookingDate,desc'
                };

                if (activeTab !== 'All') {
                    params.status = activeTab.toUpperCase();
                }
                if (debouncedSearch) {
                    params.search = debouncedSearch;
                }
                if (fromDate) {
                    params.fromDate = fromDate;
                }
                if (toDate) {
                    params.toDate = toDate;
                }

                const response = await bookingService.getMyBookings(params);
                setBookings(response.bookings || []);
                setTotalPages(response.totalPages || 1);
            } catch (error) {
                console.error(error);
                notify.error('Failed to load bookings.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchBookings();
    }, [debouncedSearch, activeTab, fromDate, toDate, page]);

    const handleCancelBooking = async () => {
        if (!bookingToCancel) return;
        setIsCanceling(true);
        try {
            await bookingService.cancelBooking(bookingToCancel);
            notify.success('Protocol terminated.');
            setCancelModalVisible(false);
            setBookingToCancel(null);

            const response = await bookingService.getMyBookings({
                page, size: 10, status: activeTab !== 'All' ? activeTab.toUpperCase() : undefined
            });
            setBookings(response.bookings || []);
        } catch (error) {
            console.error(error);
            notify.error('Failed to cancel.');
            setCancelModalVisible(false);
        } finally {
            setIsCanceling(false);
        }
    };

    return (
        <div className="my-bookings-page">
            {/* PAGE HEADER */}
            <div className="bookings-header">
                <h1>My Bookings</h1>
                <p>View and manage your test bookings</p>
                <button
                    onClick={() => navigate('/tests')}
                    className="new-booking-btn"
                >
                    <FaCalendarCheck style={{ marginRight: '8px' }} />
                    New Booking
                </button>
            </div>

            {/* MAIN CONTAINER */}
            <div className="bookings-container">
                {/* FILTER SIDEBAR */}
                <aside className="filters-sidebar">
                    <div className="filter-section">
                        <label className="filter-label">🔍 Search Booking</label>
                        <input
                            type="text"
                            placeholder="Search by reference..."
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="filter-section">
                        <label className="filter-label">📅 Date Range</label>
                        <div className="date-inputs">
                            <input
                                type="date"
                                className="date-input"
                                value={fromDate}
                                onChange={(e) => { setFromDate(e.target.value); setPage(0); }}
                            />
                            <input
                                type="date"
                                className="date-input"
                                value={toDate}
                                onChange={(e) => { setToDate(e.target.value); setPage(0); }}
                            />
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            setSearchTerm('');
                            setFromDate('');
                            setToDate('');
                            setActiveTab('All');
                        }}
                        className="reset-filters-btn"
                    >
                        Reset Filters
                    </button>
                </aside>

                {/* MAIN CONTENT */}
                <div className="bookings-main">
                    {/* STATUS TABS */}
                    <div className="status-tabs">
                        {TABS.map(tab => (
                            <button
                                key={tab}
                                onClick={() => { setActiveTab(tab); setPage(0); }}
                                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                            >
                                {tab.replace('_', ' ')}
                            </button>
                        ))}
                    </div>

                    {/* LOADING STATE */}
                    {isLoading ? (
                        <div className="bookings-list">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="skeleton-card" />
                            ))}
                        </div>
                    ) : bookings.length === 0 ? (
                        /* EMPTY STATE */
                        <div className="empty-bookings">
                            <FaCalendarAlt className="empty-icon" />
                            <h3>No Bookings Found</h3>
                            <p>You don't have any bookings yet. Start by booking a test.</p>
                        </div>
                    ) : (
                        /* BOOKINGS LIST */
                        <div className="bookings-list">
                            {bookings.map(booking => (
                                <div key={booking.id} className="booking-card">
                                    <div className="booking-card-content">
                                        <div className="booking-info">
                                            <div className="booking-icon">
                                                <FaFlask />
                                            </div>
                                            <div>
                                                <div style={{ marginBottom: '8px' }}>
                                                    <span className="booking-reference">{booking.reference}</span>
                                                    <StatusBadge status={booking.status} />
                                                </div>
                                                <h3 className="booking-details" style={{ marginBottom: '0' }}>
                                                    {booking.testName}
                                                </h3>
                                                <div className="booking-dates">
                                                    <div className="booking-date-item">
                                                        <FaCalendarAlt />
                                                        {booking.bookingDate}
                                                    </div>
                                                    <div className="booking-date-item">
                                                        <FaClock />
                                                        {booking.timeSlot}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="booking-actions">
                                            <div className="booking-amount">
                                                <div className="booking-amount-label">Amount Paid</div>
                                                <div className="booking-amount-value">${booking.totalAmount.toFixed(2)}</div>
                                            </div>
                                            <div className="booking-buttons">
                                                <BookingActions 
                                                    booking={booking}
                                                    compact={true}
                                                    showEmail={true}
                                                    onActionComplete={() => {
                                                        // Optionally refresh bookings after action
                                                    }}
                                                />
                                                {booking.status === 'PENDING' && (
                                                    <button
                                                        onClick={() => { setBookingToCancel(booking.id); setCancelModalVisible(true); }}
                                                        className="terminate-btn"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => navigate(`/booking/${booking.id}`)}
                                                    className="view-details-btn"
                                                >
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* PAGINATION */}
                    {totalPages > 1 && (
                        <div className="pagination-container">
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i)}
                                    className={`pagination-dot ${page === i ? 'active' : ''}`}
                                    aria-label={`Go to page ${i + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <ConfirmationModal
                isOpen={cancelModalVisible}
                onCancel={() => setCancelModalVisible(false)}
                onConfirm={handleCancelBooking}
                title="Terminate Protocol"
                description="This action will delete the current diagnostic node from the history. Proceed?"
                confirmText={isCanceling ? "Processing..." : "Confirm Deletion"}
                cancelText="Keep Log"
            />
        </div>
    );
};

export default MyBookingsPage;
