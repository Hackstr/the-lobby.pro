import React from 'react';
import ServerBrowser from '../components/ServerBrowser';

const ServersPage: React.FC = () => {
  return (
    <div className="servers-page">
      <div className="mb-8">
        <h1 className="text-3xl font-gaming font-bold text-white mb-2">
          CS2 Servers
        </h1>
        <p className="text-gray-400">
          Join servers and start earning tokens for your achievements
        </p>
      </div>
      
      <ServerBrowser />
    </div>
  );
};

export default ServersPage;
