import React, { useState, useEffect } from 'react';
import { Server, Users, MapPin, Wifi, Play, Globe, Lock, Target } from 'lucide-react';
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
  password_required?: boolean;
  password?: string;
  connect_command?: string;
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
      console.log('API Response:', response.data);
      
      if (response.data && response.data.data && response.data.data.servers) {
        setServers(response.data.data.servers);
      } else if (response.data && response.data.servers) {
        setServers(response.data.servers);
      } else {
        console.warn('Unexpected API response format:', response.data);
        setServers([]);
        toast.error('Unexpected server data format');
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to load servers:', error);
      toast.error('Failed to load servers - check API connection');
      setLoading(false);
      
      // Fallback to mock data for demo
      setServers([
        {
          id: "demo_server_1",
          name: "🔥 Demo CS2 Server #1",
          ip: "77.240.39.110",
          port: 27015,
          map: "de_dust2",
          players: "12/16",
          status: "online"
        }
      ]);
    }
  };

  const handleJoinServer = (server: CS2Server) => {
    const connectCommand = `steam://connect/${server.ip}:${server.port}/thelobby_sol_2024`;
    
    // Copy connect command to clipboard
    navigator.clipboard.writeText(connectCommand).then(() => {
      toast.success('Команда подключения скопирована!', {
        duration: 6000,
      });
    }).catch(() => {
      toast.error('Не удалось скопировать команду');
    });

    // Show connection instructions
    toast((t) => (
      <div className="text-sm">
        <div className="font-semibold mb-2">Инструкция подключения:</div>
        <div className="space-y-1 text-xs">
          <div>1. Откройте CS2 в Steam</div>
          <div>2. Откройте консоль (~)</div>
          <div>3. Вставьте: <code className="bg-gray-700 px-1 rounded">connect {server.ip}:27015; password thelobby_sol_2024</code></div>
          <div>4. Нажмите Enter</div>
        </div>
        <button
          onClick={() => {
            navigator.clipboard.writeText(`connect ${server.ip}:27015; password thelobby_sol_2024`);
            toast.dismiss(t.id);
            toast.success('Команда консоли скопирована!');
          }}
          className="mt-2 px-3 py-1 bg-cs2-orange text-white text-xs rounded hover:bg-cs2-orange/80"
        >
          Скопировать команду консоли
        </button>
      </div>
    ), {
      duration: 10000,
      style: {
        maxWidth: '400px',
      },
    });
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
          <div key={server.id} className="relative overflow-hidden bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-cs2-orange/50 hover:shadow-2xl hover:shadow-cs2-orange/20 transition-all duration-500 group">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-30">
              <div className="w-full h-full bg-gradient-to-br from-white/[0.02] to-transparent" 
                   style={{
                     backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                   }}>
              </div>
            </div>
            
            {/* Server Header */}
            <div className="relative z-10 mb-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-cs2-orange to-cs2-orange/70 rounded-xl flex items-center justify-center shadow-lg">
                    <Server className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-cs2-orange transition-colors">
                      {server.name}
                    </h3>
                    <p className="text-sm text-gray-400">Official Hackathon Server</p>
                  </div>
                </div>
                
                <span className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 ${
                  server.status === 'online' 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/40 shadow-lg shadow-green-500/20' 
                    : 'bg-red-500/20 text-red-400 border border-red-500/40'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${server.status === 'online' ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                  {server.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Server Info Grid */}
            <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-black/30 rounded-lg p-4 border border-gray-600/50 hover:border-cs2-blue/50 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-cs2-blue" />
                  <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">Карта</span>
                </div>
                <p className="text-white font-bold text-lg">{server.map}</p>
              </div>
              
              <div className="bg-black/30 rounded-lg p-4 border border-gray-600/50 hover:border-solana-green/50 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-solana-green" />
                  <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">Игроки</span>
                </div>
                <p className="text-white font-bold text-lg">{server.players}</p>
              </div>
              
              <div className="bg-black/30 rounded-lg p-4 border border-gray-600/50 hover:border-cs2-orange/50 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-5 h-5 text-cs2-orange" />
                  <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">IP Адрес</span>
                </div>
                <p className="text-white font-bold text-sm font-mono">{server.ip}:{server.port}</p>
              </div>
              
              <div className="bg-black/30 rounded-lg p-4 border border-gray-600/50 hover:border-yellow-400/50 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-5 h-5 text-yellow-400" />
                  <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">Доступ</span>
                </div>
                <p className="text-yellow-400 font-bold">Защищён</p>
              </div>
            </div>

            {/* Game Mode & Features */}
            <div className="relative z-10 flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cs2-blue/20 to-cs2-blue/10 border border-cs2-blue/30 rounded-lg">
                  <Target className="w-4 h-4 text-cs2-blue" />
                  <span className="text-sm font-semibold text-cs2-blue">Deathmatch</span>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-purple-500/10 border border-purple-500/30 rounded-lg">
                  <span className="text-sm font-semibold text-purple-400">🤖 Боты</span>
                </div>
              </div>
              
              <div className="text-xs text-gray-400 bg-black/20 px-3 py-1 rounded-lg">
                🪙 SKILLS токены за хедшоты и серии
              </div>
            </div>

            {/* Action Button */}
            <div className="relative z-10">
              <button
                onClick={() => handleJoinServer(server)}
                disabled={server.status !== 'online'}
                className={`w-full px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 ${
                  server.status === 'online'
                    ? 'bg-gradient-to-r from-cs2-orange via-cs2-orange/90 to-cs2-blue text-white hover:from-cs2-orange/90 hover:to-cs2-blue/90 transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-cs2-orange/30'
                    : 'bg-gray-600/50 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Play className="w-6 h-6" />
                <span>{server.status === 'online' ? 'Подключиться к серверу' : 'Сервер недоступен'}</span>
                {server.status === 'online' && (
                  <div className="ml-2 text-sm opacity-75">
                    → Steam
                  </div>
                )}
              </button>
            </div>

            {/* Hover Effect Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-cs2-orange/5 to-cs2-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl pointer-events-none"></div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default ServerBrowser;
