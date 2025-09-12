import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Trophy, Target, Zap, TrendingUp, Calendar } from 'lucide-react';
import { getPlayerDashboard } from '../services/api';
import toast from 'react-hot-toast';

interface PlayerStats {
  headshots: number;
  kill_streaks: number;
  total_kills: number;
  wallet_address: string;
}

interface Achievement {
  type: string;
  timestamp: string;
  map?: string;
  streak_count?: number;
}

interface DashboardData {
  wallet_address: string;
  stats: PlayerStats;
  recent_achievements: Achievement[];
  last_updated: string;
}

const TokenDashboard: React.FC = () => {
  const { connected, publicKey } = useWallet();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (connected && publicKey) {
      loadDashboard();
    }
  }, [connected, publicKey]);

  const loadDashboard = async () => {
    if (!publicKey) return;
    
    setLoading(true);
    try {
      const response = await getPlayerDashboard(publicKey.toString());
      setDashboardData(response.data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <div className="text-center py-12">
        <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">
          Connect Your Wallet
        </h2>
        <p className="text-gray-400">
          Connect your Solana wallet to view your gaming achievements and tokens
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-solana-purple"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">
          No Gaming Data Yet
        </h2>
        <p className="text-gray-400 mb-4">
          Start playing CS2 on our servers to earn your first tokens!
        </p>
        <button
          onClick={loadDashboard}
          className="px-6 py-2 bg-solana-purple text-white rounded-lg hover:bg-solana-purple/80 transition-colors"
        >
          Refresh Dashboard
        </button>
      </div>
    );
  }

  const { stats, recent_achievements } = dashboardData;

  return (
    <div className="token-dashboard space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="cs2-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <Target className="w-8 h-8 text-cs2-orange" />
            <div>
              <h3 className="text-lg font-semibold text-white">Headshot Tokens</h3>
              <p className="text-sm text-gray-400">NFTs Earned</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-cs2-orange">
            {stats.headshots}
          </div>
        </div>

        <div className="cs2-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <Zap className="w-8 h-8 text-cs2-blue" />
            <div>
              <h3 className="text-lg font-semibold text-white">Streak Tokens</h3>
              <p className="text-sm text-gray-400">Kill Streaks</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-cs2-blue">
            {stats.kill_streaks}
          </div>
        </div>

        <div className="cs2-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-8 h-8 text-solana-green" />
            <div>
              <h3 className="text-lg font-semibold text-white">Total Kills</h3>
              <p className="text-sm text-gray-400">All Time</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-solana-green">
            {stats.total_kills}
          </div>
        </div>
      </div>

      {/* Recent Achievements */}
      <div className="cs2-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <h3 className="text-xl font-semibold text-white">Recent Achievements</h3>
        </div>

        {recent_achievements.length > 0 ? (
          <div className="space-y-3">
            {recent_achievements.map((achievement, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-gray-700">
                <div className="flex items-center gap-3">
                  {achievement.type === 'headshot' ? (
                    <Target className="w-5 h-5 text-cs2-orange" />
                  ) : (
                    <Zap className="w-5 h-5 text-cs2-blue" />
                  )}
                  <div>
                    <div className="text-white font-medium">
                      {achievement.type === 'headshot' 
                        ? 'Headshot Token Earned' 
                        : `${achievement.streak_count}-Kill Streak Token`
                      }
                    </div>
                    {achievement.map && (
                      <div className="text-sm text-gray-400">
                        Map: {achievement.map}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-400">
                  <Calendar className="w-4 h-4" />
                  {new Date(achievement.timestamp).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No achievements yet. Start playing to earn tokens!</p>
          </div>
        )}
      </div>

      {/* Wallet Info */}
      <div className="cs2-card p-6">
        <h3 className="text-lg font-semibold text-white mb-3">Wallet Information</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Address:</span>
            <span className="font-mono text-white">
              {stats.wallet_address.slice(0, 8)}...{stats.wallet_address.slice(-8)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Network:</span>
            <span className="text-solana-purple">Solana Devnet</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Last Updated:</span>
            <span className="text-gray-300">
              {new Date(dashboardData.last_updated).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenDashboard;
