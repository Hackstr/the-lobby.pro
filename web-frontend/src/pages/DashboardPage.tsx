import React from 'react';
import TokenDashboard from '../components/TokenDashboard';
import DemoControls from '../components/DemoControls';
import LiveFeed from '../components/LiveFeed';

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
      
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <DemoControls />
          <TokenDashboard />
        </div>
        <div>
          <LiveFeed />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
