import React from 'react';
import ServerBrowser from '../components/ServerBrowser';

const ServersPage: React.FC = () => {
  return (
    <div className="servers-page">
      <div className="mb-8">
        <h1 className="text-3xl font-mono font-bold mb-2">
          CS2 Servers
        </h1>
        <p className="text-[color:var(--brand-text)]/70">
          Join servers and start earning tokens for your achievements
        </p>
      </div>
      
      <ServerBrowser />
    </div>
  );
};

export default ServersPage;
