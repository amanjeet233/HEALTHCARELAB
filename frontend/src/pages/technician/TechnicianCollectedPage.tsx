import React from 'react';
import TechnicianDashboardPage from './TechnicianDashboardPage';

const TechnicianCollectedPage: React.FC = () => (
  <TechnicianDashboardPage
    forcedTab="completed"
    lockTab
    breadcrumbLabel="Collected Samples"
    pageHeading={<>Collected <span className="text-cyan-600">Samples</span></>}
  />
);

export default TechnicianCollectedPage;
