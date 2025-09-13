import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Target, Zap, Play, RefreshCw, RotateCcw } from 'lucide-react';
import { request } from '../services/api';
import toast from 'react-hot-toast';

const DemoControls: React.FC = () => {
  const { connected, publicKey } = useWallet();
  const [loading, setLoading] = useState(false);

  const simulateHeadshot = async () => {
    if (!publicKey) return;
    
    setLoading(true);
    try {
      const response: any = await request(`/api/players/${publicKey.toString()}/simulate-headshot`, { method: 'POST' });
      
      if (response?.success) {
        toast.success(response.message || '🎯 SKILLS токен получен!', {
          duration: 4000,
        });
        
        // Refresh page data
        window.location.reload();
      } else {
        toast.error('Ошибка симуляции хедшота');
      }
    } catch (error) {
      console.error('Headshot simulation failed:', error);
      toast.error('Ошибка подключения к API');
    } finally {
      setLoading(false);
    }
  };

  const simulateKillStreak = async () => {
    if (!publicKey) return;
    
    setLoading(true);
    try {
      const response: any = await request(`/api/players/${publicKey.toString()}/simulate-streak`, {
        method: 'POST',
        body: { streak_count: 10 }
      });
      
      if (response?.success) {
        toast.success(response.message || '⚡ SKILLS токен получен!', {
          duration: 4000,
        });
        
        // Refresh page data
        window.location.reload();
      } else {
        toast.error('Ошибка симуляции серии');
      }
    } catch (error) {
      console.error('Kill streak simulation failed:', error);
      toast.error('Ошибка подключения к API');
    } finally {
      setLoading(false);
    }
  };

  const resetPlayerStats = async () => {
    if (!publicKey) return;
    
    setLoading(true);
    try {
      const response: any = await request(`/api/players/${publicKey.toString()}/reset-stats`, { method: 'POST' });
      // Обновим UI без полной перезагрузки
      try { (window as any).location && (window as any).history && window.history.replaceState({}, '', window.location.href) } catch {}
      setTimeout(() => window.location.reload(), 300);
      
      if (response?.success) {
        toast.success('🔄 Статистика сброшена!', {
          duration: 4000,
        });
        
        // Refresh page data
        window.location.reload();
      } else {
        toast.error('Ошибка сброса статистики');
      }
    } catch (error) {
      console.error('Reset stats failed:', error);
      toast.error('Ошибка подключения к API');
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return null;
  }

  return (
    <div className="demo-controls cs2-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Play className="w-5 h-5 text-solana-purple" />
          Demo Controls (для тестирования)
        </h3>
        
        {loading && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Обработка...
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={simulateHeadshot}
          disabled={loading}
          className="flex items-center gap-3 p-4 bg-gradient-to-r from-cs2-orange/20 to-cs2-orange/10 border border-cs2-orange/30 rounded-lg hover:bg-cs2-orange/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Target className="w-6 h-6 text-cs2-orange" />
          <div className="text-left">
            <div className="text-white font-medium">Симулировать хедшот</div>
            <div className="text-sm text-gray-400">+10 XP, +1 SKILLS</div>
          </div>
        </button>

        <button
          onClick={simulateKillStreak}
          disabled={loading}
          className="flex items-center gap-3 p-4 bg-gradient-to-r from-cs2-blue/20 to-cs2-blue/10 border border-cs2-blue/30 rounded-lg hover:bg-cs2-blue/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Zap className="w-6 h-6 text-cs2-blue" />
          <div className="text-left">
            <div className="text-white font-medium">Симулировать серию</div>
            <div className="text-sm text-gray-400">+50 XP, +5 SKILLS</div>
          </div>
        </button>

        <button
          onClick={resetPlayerStats}
          disabled={loading}
          className="flex items-center gap-3 p-4 bg-gradient-to-r from-red-500/20 to-red-500/10 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCcw className="w-6 h-6 text-red-400" />
          <div className="text-left">
            <div className="text-white font-medium">Сбросить статистику</div>
            <div className="text-sm text-gray-400">Обнулить все данные</div>
          </div>
        </button>
      </div>
      
    </div>
  );
};

export default DemoControls;
