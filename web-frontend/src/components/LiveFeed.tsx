import React from 'react';
import { Target, Zap, Trophy, Clock } from 'lucide-react';
import { useWebSocket } from '../hooks/useWebSocket';

const LiveFeed: React.FC = () => {
  const { achievements, isConnected } = useWebSocket();

  return (
    <div className="live-feed cs2-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          Live Feed
        </h3>
        
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-600' : 'bg-gray-400'} animate-pulse`}></div>
      </div>

      {achievements.length > 0 ? (
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {achievements.map((achievement, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-black/5 rounded-lg border-l-4 border-l-[color:var(--brand-accent)]">
              {achievement.type === 'headshot' ? (
                <Target className="w-5 h-5 text-[color:var(--brand-accent)] flex-shrink-0" />
              ) : (
                <Zap className="w-5 h-5 text-[color:var(--brand-accent)] flex-shrink-0" />
              )}
              
              <div className="flex-1 min-w-0">
                <div className="font-medium">
                  {achievement.type === 'headshot' 
                    ? '🎯 Хедшот токен получен!' 
                    : `⚡ Серия из ${achievement.streak_count} убийств!`
                  }
                </div>
                <div className="text-sm text-[color:var(--brand-text)]/60">
                  +{achievement.xp_gained} XP
                </div>
              </div>
              
              <div className="flex items-center gap-1 text-xs text-[color:var(--brand-text)]/60">
                <Clock className="w-3 h-3" />
                Только что
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Trophy className="w-12 h-12 text-[color:var(--brand-text)]/50 mx-auto mb-3 opacity-50" />
          <p className="text-[color:var(--brand-text)]/60">
            {isConnected 
              ? 'Ожидаем достижения...' 
              : 'Подключитесь для live обновлений'
            }
          </p>
        </div>
      )}
      
      {!isConnected && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-sm text-red-700">
            🔴 <strong>Offline режим:</strong> Real-time обновления недоступны. 
            Проверьте подключение к API.
          </p>
        </div>
      )}
    </div>
  );
};

export default LiveFeed;
