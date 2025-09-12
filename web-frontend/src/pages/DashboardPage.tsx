import React from 'react';
import TokenDashboard from '../components/TokenDashboard';

const DashboardPage: React.FC = () => {
  return (
    <div className="dashboard-page">
      <div className="mb-8">
        <h1 className="text-3xl font-gaming font-bold text-white mb-2">
          Player Dashboard
        </h1>
        <p className="text-gray-400">
          View your gaming achievements and collected tokens
        </p>
      </div>
      
      <TokenDashboard />
    </div>
  );
};

export default DashboardPage;
