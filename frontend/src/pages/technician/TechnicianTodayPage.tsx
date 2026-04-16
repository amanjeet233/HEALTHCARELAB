import React from 'react';
import TechnicianDashboardPage from './TechnicianDashboardPage';

const TechnicianTodayPage: React.FC = () => (
  <TechnicianDashboardPage
    forcedTab="today"
    lockTab
    breadcrumbLabel="Today's Bookings"
    pageHeading={<>Today's <span className="text-cyan-600">Bookings</span></>}
  />
);

export default TechnicianTodayPage;
