import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import ProtectedRoute from './ProtectedRoute';
import PageTransition from '../common/PageTransition';
import LoadingSpinner from '../common/LoadingSpinner';

// Lazy-loaded pages
// Auth views are now handled via AuthModal
const LandingPage = lazy(() => import('../../pages/LandingPage'));
const TestListingPage = lazy(() => import('../../pages/TestListingPage'));
const TestDetailPage = lazy(() => import('../../pages/TestDetailPage'));
const CartPage = lazy(() => import('../../pages/CartPage'));
const PackagesListingPage = lazy(() => import('../../pages/packages/PackagesListingPage'));
const PackageDetailPage = lazy(() => import('../../pages/packages/PackageDetailPage'));
const BookingPage = lazy(() => import('../../pages/BookingPage'));
const MyBookingsPage = lazy(() => import('../../pages/MyBookingsPage'));
const ReportsPage = lazy(() => import('../../pages/ReportsPage'));
const ProfilePage = lazy(() => import('../../pages/ProfilePage'));
const NotificationCenter = lazy(() => import('../../pages/NotificationCenter'));
const AdminDashboard = lazy(() => import('../../pages/admin/AdminDashboard'));
const BookConsultationPage = lazy(() => import('../../pages/BookConsultationPage'));
const FamilyMembersPage = lazy(() => import('../../pages/FamilyMembersPage'));
const SmartReportsPage = lazy(() => import('../../pages/SmartReportsPage'));
const HealthInsightsPage = lazy(() => import('../../pages/HealthInsightsPage'));
const LabPartnerPage = lazy(() => import('../../pages/LabPartnerPage'));
const AuditLogsPage = lazy(() => import('../../pages/AuditLogsPage'));
const PromoCodesPage = lazy(() => import('../../pages/PromoCodesPage'));
const CategoryListingPage = lazy(() => import('../../pages/CategoryListingPage'));
const TestListingBySlugPage = lazy(() => import('../../pages/TestListingBySlugPage'));
const WomenWellnessPage = lazy(() => import('../../pages/WomenWellnessPage'));

import MainLayout from './MainLayout';
import { GenericPageSkeleton } from '../ui/PageSkeleton';

const AnimatedRoutes: React.FC = () => {
    const location = useLocation();

    return (
        <Suspense fallback={<GenericPageSkeleton />}>
            <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                    <Route path="/login" element={<Navigate to="/" replace />} />
                    <Route path="/register" element={<Navigate to="/" replace />} />
                    <Route path="/forgot-password" element={<Navigate to="/" replace />} />
                    <Route path="/reset-password" element={<Navigate to="/" replace />} />

                    {/* Unified Platform Pages (with persistent header/footer) */}
                    <Route element={<MainLayout />}>
                        <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
                        {/* ── Lab Tests routes (MedSync style) ── */}
                        {/* Specific routes MUST come before dynamic :slug routes */}
                        <Route path="/lab-tests" element={<PageTransition><TestListingPage /></PageTransition>} />
                        <Route path="/lab-tests/all-lab-tests" element={<PageTransition><TestListingBySlugPage slugOverride="all-lab-tests" /></PageTransition>} />
                        <Route path="/category-listing/:slug" element={<PageTransition><CategoryListingPage /></PageTransition>} />
                        {/* Specific /test-listing/ routes BEFORE the wildcard */}
                        <Route path="/test-listing/popular-health-checkup-packages" element={<PageTransition><PackagesListingPage /></PageTransition>} />
                        <Route path="/test-listing/women-wellness" element={<PageTransition><WomenWellnessPage /></PageTransition>} />
                        <Route path="/test-listing/top-booked-tests" element={<PageTransition><TestListingBySlugPage /></PageTransition>} />
                        {/* Dynamic wildcard LAST */}
                        <Route path="/test-listing/:slug" element={<PageTransition><TestListingBySlugPage /></PageTransition>} />
                        <Route path="/lab-tests-category/:categorySlug" element={<PageTransition><TestListingBySlugPage /></PageTransition>} />

                        <Route path="/tests" element={<PageTransition><TestListingPage /></PageTransition>} />
                        <Route path="/test/:slug" element={<PageTransition><TestDetailPage /></PageTransition>} />
                        <Route path="/packages" element={<PageTransition><PackagesListingPage /></PageTransition>} />
                        <Route path="/packages/category/:pathCategory" element={<PageTransition><PackagesListingPage /></PageTransition>} />
                        <Route path="/packages/tier/:pathTier" element={<PageTransition><PackagesListingPage /></PageTransition>} />
                        <Route path="/packages/:slug" element={<PageTransition><PackageDetailPage /></PageTransition>} />

                        {/* Public Pages - No auth required */}
                        <Route path="/cart" element={<PageTransition><CartPage /></PageTransition>} />
                        <Route path="/promos" element={<PageTransition><PromoCodesPage /></PageTransition>} />

                        {/* Protected Unified Pages */}
                        <Route element={<ProtectedRoute />}>
                            <Route path="/booking/:id" element={<PageTransition><BookingPage /></PageTransition>} />
                            <Route path="/my-bookings" element={<PageTransition><MyBookingsPage /></PageTransition>} />
                            <Route path="/profile" element={<PageTransition><ProfilePage /></PageTransition>} />
                            <Route path="/family-members" element={<PageTransition><FamilyMembersPage /></PageTransition>} />
                            <Route path="/health-insights" element={<PageTransition><HealthInsightsPage /></PageTransition>} />
                            <Route path="/lab-partners" element={<PageTransition><LabPartnerPage /></PageTransition>} />
                            <Route path="/notifications" element={<PageTransition><NotificationCenter /></PageTransition>} />
                            <Route path="/admin" element={<PageTransition><AdminDashboard /></PageTransition>} />
                            <Route path="/admin/audit-logs" element={<PageTransition><AuditLogsPage /></PageTransition>} />
                            <Route path="/book-consultation" element={<PageTransition><BookConsultationPage /></PageTransition>} />
                            <Route path="/reports" element={<PageTransition><ReportsPage /></PageTransition>} />
                            <Route path="/smart-reports" element={<PageTransition><SmartReportsPage /></PageTransition>} />
                            <Route path="/my-reports" element={<Navigate to="/reports" replace />} />
                        </Route>
                    </Route>

                    {/* All legacy /dashboard routes are now integrated into the Landing Page SPA experience */}
                    <Route path="/dashboard/*" element={<Navigate to="/" replace />} />

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AnimatePresence>
        </Suspense>
    );
};

export default AnimatedRoutes;
