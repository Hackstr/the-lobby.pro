import React, { useState, useEffect } from 'react';
import { Crown, Trophy, Target, Zap, Medal } from 'lucide-react';
import { request } from '../services/api';

interface LeaderboardPlayer {
  rank: number;
  wallet_address: string;
  display_name: string;
  headshots: number;
  kill_streaks: number;
  total_kills: number;
  xp: number;
  level: string;
}

const Leaderboard: React.FC = () => {
  const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'xp' | 'headshots' | 'streaks'>('xp');

  useEffect(() => {
    loadLeaderboard();
  }, [activeTab]);

  const loadLeaderboard = async () => {
    setLoading(true);
    
    try {
      const response: any = await request(`/api/leaderboard?sort_by=${activeTab}`);
      
      if (response?.success) {
        setPlayers(response.data.players);
      } else {
        console.error('Failed to load leaderboard:', response?.error);
        // Fallback to empty array
        setPlayers([]);
      }
    } catch (error) {
      console.error('Leaderboard API error:', error);
      // Fallback to empty array for demo
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  };

  const getSortedPlayers = () => {
    // Backend уже возвращает отсортированные данные
    return players;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-5 h-5 text-yellow-400" />;
      case 2: return <Medal className="w-5 h-5 text-gray-300" />;
      case 3: return <Medal className="w-5 h-5 text-orange-400" />;
      default: return <div className="w-5 h-5 flex items-center justify-center text-gray-400 font-bold text-sm">#{rank}</div>;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Легенда': return 'text-yellow-400';
      case 'Мастер': return 'text-orange-400';
      case 'Ветеран': return 'text-purple-400';
      case 'Снайпер': return 'text-blue-400';
      case 'Стрелок': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="leaderboard cs2-card p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--brand-accent)]"></div>
        </div>
      </div>
    );
  }

  const sortedPlayers = getSortedPlayers();

  return (
    <div className="leaderboard cs2-card p-6">

      {/* Tabs */}
      <div className="inline-flex p-1 rounded-lg bg-black/5 border border-[color:var(--brand-border)] mb-6">
        {[
          { key: 'xp', label: 'XP', icon: Trophy },
          { key: 'headshots', label: 'Хедшоты', icon: Target },
          { key: 'streaks', label: 'Серии', icon: Zap },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                activeTab === tab.key
                  ? 'bg-white text-[color:var(--brand-accent)] shadow-sm'
                  : 'text-[color:var(--brand-text)]/70 hover:text-[color:var(--brand-text)]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Leaderboard List */}
      <div className="space-y-2">
        {sortedPlayers.map((player, index) => (
          <div 
            key={player.wallet_address}
            className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
              index < 3 
                ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20' 
                : 'bg-white border border-[color:var(--brand-border)]'
            }`}
          >
            {/* Rank */}
            <div className="flex items-center justify-center w-8">
              {getRankIcon(player.rank)}
            </div>

            {/* Player Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <div className="font-medium">
                  {player.display_name}
                </div>
                {index === 1 && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-yellow-500/10 text-yellow-700 border border-yellow-500/30">Champion</span>
                )}
                <div className={`px-2 py-1 rounded text-xs font-medium ${(player as any).level_color || getLevelColor(player.level)} bg-black/5`}>
                  {player.level}
                </div>
              </div>
              <div className="text-xs text-[color:var(--brand-text)]/60 font-mono">
                {player.wallet_address.slice(0, 8)}...{player.wallet_address.slice(-4)}
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 text-sm">
              {activeTab === 'xp' && (
                <div className="text-center">
                  <div className="font-bold text-[color:var(--brand-text)]">{player.xp}</div>
                  <div className="text-[color:var(--brand-text)]/60 text-xs">XP</div>
                </div>
              )}
              
              {activeTab === 'headshots' && (
                <div className="text-center">
                  <div className="text-[color:var(--brand-accent)] font-bold">{player.headshots}</div>
                  <div className="text-[color:var(--brand-text)]/60 text-xs">Хедшоты</div>
                </div>
              )}
              
              {activeTab === 'streaks' && (
                <div className="text-center">
                  <div className="text-[color:var(--brand-accent)] font-bold">{player.kill_streaks}</div>
                  <div className="text-[color:var(--brand-text)]/60 text-xs">Серии</div>
                </div>
              )}
              
              <div className="text-center">
                <div className="text-[color:var(--brand-text)]">{player.total_kills}</div>
                <div className="text-[color:var(--brand-text)]/60 text-xs">Убийств</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-[color:var(--brand-accent)]/10 rounded-lg border border-[color:var(--brand-accent)]/20">
        <p className="text-sm text-[color:var(--brand-text)] text-center">
          🏆 Реальный лидерборд игроков The-lobby.pro
        </p>
      </div>
    </div>
  );
};

export default Leaderboard;
