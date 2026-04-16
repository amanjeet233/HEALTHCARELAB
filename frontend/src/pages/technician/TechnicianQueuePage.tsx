import React from 'react';
import TechnicianDashboardPage from './TechnicianDashboardPage';

const TechnicianQueuePage: React.FC = () => (
  <TechnicianDashboardPage
    forcedTab="pending"
    lockTab
    breadcrumbLabel="Collection Queue"
    pageHeading={<>Collection <span className="text-cyan-600">Queue</span></>}
  />
);

export default TechnicianQueuePage;
