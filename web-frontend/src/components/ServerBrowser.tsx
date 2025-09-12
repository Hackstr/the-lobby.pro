import React, { useState, useEffect } from 'react';
import { Server, Users, MapPin, Wifi, Play } from 'lucide-react';
import { getServers } from '../services/api';
import toast from 'react-hot-toast';

interface CS2Server {
  id: string;
  name: string;
  ip: string;
  port: number;
  map: string;
  players: string;
  status: string;
}

const ServerBrowser: React.FC = () => {
  const [servers, setServers] = useState<CS2Server[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServers();
  }, []);

  const loadServers = async () => {
    try {
      const response = await getServers();
      setServers(response.data.servers);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load servers:', error);
      toast.error('Failed to load servers');
      setLoading(false);
    }
  };

  const handleJoinServer = (server: CS2Server) => {
    // In a real implementation, this would connect to the CS2 server
    toast.success(`Connecting to ${server.name}...`);
    
    // For hackathon demo, we'll simulate joining
    setTimeout(() => {
      toast.success('Connected! Start playing to earn tokens!');
    }, 2000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-solana-purple"></div>
      </div>
    );
  }

  return (
    <div className="server-browser">
      <div className="flex items-center gap-3 mb-6">
        <Server className="w-6 h-6 text-cs2-orange" />
        <h2 className="text-2xl font-gaming font-bold text-white">
          CS2 Servers
        </h2>
      </div>

      <div className="grid gap-4">
        {servers.map((server) => (
          <div key={server.id} className="cs2-card p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-white">
                    {server.name}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    server.status === 'online' 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    <Wifi className="w-3 h-3 inline mr-1" />
                    {server.status}
                  </span>
                </div>
                
                <div className="flex items-center gap-6 text-sm text-gray-300">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{server.map}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{server.players}</span>
                  </div>
                  <div className="text-gray-400 font-mono">
                    {server.ip}:{server.port}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleJoinServer(server)}
                disabled={server.status !== 'online'}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cs2-orange to-cs2-blue text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cs2-orange/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="w-4 h-4" />
                Join Server
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-gradient-to-r from-solana-purple/10 to-solana-green/10 rounded-lg border border-solana-purple/20">
        <h3 className="text-lg font-semibold text-white mb-2">
          🎯 How to Earn Tokens
        </h3>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• Get <span className="text-cs2-orange font-semibold">1 Headshot Token</span> for each headshot kill</li>
          <li>• Get <span className="text-cs2-blue font-semibold">1 Streak Token</span> for every 10-kill streak</li>
          <li>• All tokens are minted as NFTs on Solana blockchain</li>
          <li>• View your collection in the Dashboard</li>
        </ul>
      </div>
    </div>
  );
};

export default ServerBrowser;
