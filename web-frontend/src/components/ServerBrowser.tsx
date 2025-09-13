import React, { useState, useEffect } from 'react';
import { Server, Users, MapPin, Play, Globe, Lock, Target } from 'lucide-react';
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
      const response: any = await getServers();
      console.log('API Response:', response);
      
      if (response && response.data && response.data.servers) {
        setServers(response.data.servers);
      } else if (response && response.servers) {
        setServers(response.servers);
      } else {
        console.warn('Unexpected API response format:', response);
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
        <Server className="w-6 h-6 text-[color:var(--brand-accent)]" />
        <h2 className="text-2xl font-mono font-bold">
          CS2 Servers
        </h2>
      </div>

      <div className="grid gap-4">
        {servers.map((server) => (
          <div key={server.id} className="relative overflow-hidden bg-white border border-[color:var(--brand-border)] rounded-xl p-6 hover:border-[color:var(--brand-accent)]/50 hover:shadow-xl hover:shadow-[color:var(--brand-accent)]/10 transition-all duration-300 group">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-30">
              <div className="w-full h-full bg-gradient-to-br from-white/[0.02] to-transparent" 
                   style={{
                     backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
                   }}>
              </div>
            </div>
            
            {/* Server Header */}
            <div className="relative z-10 mb-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center border border-[color:var(--brand-accent)]/40 bg-[color:var(--brand-accent)]/10">
                    <Server className="w-7 h-7 text-[color:var(--brand-accent)]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold group-hover:text-[color:var(--brand-accent)] transition-colors">
                      {server.name}
                    </h3>
                    <p className="text-sm text-[color:var(--brand-text)]/60">Official Hackathon Server</p>
                  </div>
                </div>
                
                <span className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 ${
                  server.status === 'online' 
                    ? 'bg-green-500/10 text-green-700 border border-green-500/30' 
                    : 'bg-red-500/10 text-red-700 border border-red-500/30'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${server.status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                  {server.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Server Info Grid */}
            <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-black/5 rounded-lg p-4 border border-[color:var(--brand-border)] hover:border-[color:var(--brand-accent)]/40 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-[color:var(--brand-accent)]" />
                  <span className="text-xs text-[color:var(--brand-text)]/60 uppercase tracking-wider font-medium">Карта</span>
                </div>
                <p className="font-bold text-lg">{server.map}</p>
              </div>
              
              <div className="bg-black/5 rounded-lg p-4 border border-[color:var(--brand-border)] hover:border-[color:var(--brand-accent)]/40 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-[color:var(--brand-accent)]" />
                  <span className="text-xs text-[color:var(--brand-text)]/60 uppercase tracking-wider font-medium">Игроки</span>
                </div>
                <p className="font-bold text-lg">{server.players}</p>
              </div>
              
              <div className="bg-black/5 rounded-lg p-4 border border-[color:var(--brand-border)] hover:border-[color:var(--brand-accent)]/40 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-5 h-5 text-[color:var(--brand-accent)]" />
                  <span className="text-xs text-[color:var(--brand-text)]/60 uppercase tracking-wider font-medium">IP Адрес</span>
                </div>
                <p className="font-bold text-sm font-mono">{server.ip}:{server.port}</p>
              </div>
              
              <div className="bg-black/5 rounded-lg p-4 border border-[color:var(--brand-border)] hover:border-[color:var(--brand-accent)]/40 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-5 h-5 text-yellow-400" />
                  <span className="text-xs text-[color:var(--brand-text)]/60 uppercase tracking-wider font-medium">Доступ</span>
                </div>
                <p className="text-yellow-700 font-bold">Защищён</p>
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
              
              <div className="text-xs text-[color:var(--brand-text)]/70 bg-black/5 px-3 py-1 rounded-lg">
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
                    ? 'bg-[color:var(--brand-accent)] text-white hover:opacity-90'
                    : 'bg-black/10 text-[color:var(--brand-text)]/50 cursor-not-allowed'
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
