import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { User, Award, Star, TrendingUp, Target, Zap, Crown, Medal } from 'lucide-react';
import { getPlayerDashboard, request } from '../services/api';
import toast from 'react-hot-toast';

interface PlayerLevel {
  level: number;
  title: string;
  minXP: number;
  maxXP: number;
  color: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

const PLAYER_LEVELS: PlayerLevel[] = [
  { level: 1, title: "Новичок", minXP: 0, maxXP: 50, color: "text-gray-400" },
  { level: 2, title: "Стрелок", minXP: 50, maxXP: 150, color: "text-green-400" },
  { level: 3, title: "Снайпер", minXP: 150, maxXP: 300, color: "text-blue-400" },
  { level: 4, title: "Ветеран", minXP: 300, maxXP: 500, color: "text-purple-400" },
  { level: 5, title: "Легенда", minXP: 500, maxXP: 99999, color: "text-yellow-400" },
];

const PlayerProfile: React.FC = () => {
  const { connected, publicKey } = useWallet();
  const [playerData, setPlayerData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [currentLevel, setCurrentLevel] = useState<PlayerLevel>(PLAYER_LEVELS[0]);
  const [xp, setXP] = useState(0);
  const [claimingAchievement, setClaimingAchievement] = useState<string | null>(null);

  useEffect(() => {
    if (connected && publicKey) {
      loadPlayerData();
    }
  }, [connected, publicKey]);

  const loadPlayerData = async () => {
    if (!publicKey) return;
    
    setLoading(true);
    try {
      const response: any = await getPlayerDashboard(publicKey.toString());
      // API может вернуть {success, data} или сразу объект данных
      const playerData = (response && response.success) ? response.data : response;
      
      setPlayerData(playerData);
      
      // Calculate XP and level
      const stats = playerData.stats;
      
      // Backend уже вычисляет XP, используем его напрямую
      const safeXP = stats.xp || 0;
      setXP(safeXP);
      
      // Determine level - используем backend level если есть, иначе вычисляем
      let level;
      if (stats.level && typeof stats.level === 'object') {
        // Backend возвращает level с разными именами полей, приводим к единому формату
        level = {
          level: stats.level.level,
          title: stats.level.title,
          color: stats.level.color,
          minXP: stats.level.min_xp,
          maxXP: stats.level.max_xp
        };
      } else {
        // Вычисляем level локально
        level = PLAYER_LEVELS.find(l => safeXP >= l.minXP && safeXP < l.maxXP) || PLAYER_LEVELS[0];
      }
      setCurrentLevel(level);
      
    } catch (error) {
      console.error('Failed to load player data:', error);
      toast.error('Failed to load player profile - using demo data');
      
      // Fallback to demo data for hackathon
      const demoData = {
        stats: {
          headshots: 15,
          kill_streaks: 3,
          total_kills: 87,
          xp: 339, // (15 * 10) + (3 * 50) + (87 * 2)
          wallet_address: publicKey.toString()
        },
        recent_achievements: [
          {
            type: "headshot",
            timestamp: new Date().toISOString(),
            map: "de_dust2"
          },
          {
            type: "kill_streak",
            streak_count: 10,
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            map: "de_mirage"
          }
        ]
      };
      
      setPlayerData(demoData);
      
      const demoXP = 339;
      setXP(demoXP);
      
      const level = PLAYER_LEVELS.find(l => demoXP >= l.minXP && demoXP < l.maxXP) || PLAYER_LEVELS[0];
      setCurrentLevel(level);
    } finally {
      setLoading(false);
    }
  };

  const claimAchievement = async (achievementId: string) => {
    if (!publicKey) return;
    
    setClaimingAchievement(achievementId);
    try {
      const response: any = await request(`/api/players/${publicKey.toString()}/claim-achievement`, {
        method: 'POST',
        body: { achievement_id: achievementId }
      });
      
      if (response?.success) {
        toast.success(response.message, {
          duration: 5000,
        });
        
        // Refresh page data
        loadPlayerData();
      } else {
        toast.error(response?.message || 'Не удалось забрать достижение');
      }
    } catch (error) {
      console.error('Achievement claim failed:', error);
      toast.error('Ошибка подключения к API');
    } finally {
      setClaimingAchievement(null);
    }
  };

  const getAchievementName = (achievementId: string): string => {
    const achievementNames: { [key: string]: string } = {
      'first_headshot': 'Первый хедшот',
      'headshot_master': 'Мастер хедшотов',
      'first_streak': 'Первая серия',
      'streak_legend': 'Легенда серий',
      'killer': 'Убийца',
      'unknown': 'Специальное достижение'
    };
    return achievementNames[achievementId] || achievementNames[achievementId?.toLowerCase()] || achievementId || 'Специальное достижение';
  };

  const getAchievements = (): Achievement[] => {
    if (!playerData || !playerData.stats) return [];
    
    const stats = playerData.stats;
    
    return [
      {
        id: 'first_headshot',
        name: 'Первый хедшот',
        description: 'Получи свой первый хедшот',
        icon: Target,
        unlocked: stats.headshots > 0,
      },
      {
        id: 'headshot_master',
        name: 'Мастер хедшотов',
        description: 'Получи 50 хедшотов',
        icon: Target,
        unlocked: stats.headshots >= 50,
        progress: Math.min(stats.headshots, 50),
        maxProgress: 50,
      },
      {
        id: 'first_streak',
        name: 'Первая серия',
        description: 'Получи первую серию из 10 убийств',
        icon: Zap,
        unlocked: stats.kill_streaks > 0,
      },
      {
        id: 'streak_legend',
        name: 'Легенда серий',
        description: 'Получи 10 серий убийств',
        icon: Crown,
        unlocked: stats.kill_streaks >= 10,
        progress: Math.min(stats.kill_streaks, 10),
        maxProgress: 10,
      },
      {
        id: 'killer',
        name: 'Убийца',
        description: 'Сделай 100 убийств',
        icon: Medal,
        unlocked: stats.total_kills >= 100,
        progress: Math.min(stats.total_kills, 100),
        maxProgress: 100,
      },
    ];
  };

  if (!connected) {
    return (
      <div className="text-center py-12">
        <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">
          Подключи кошелёк
        </h2>
        <p className="text-gray-400">
          Подключи Phantom кошелёк чтобы увидеть свой профиль игрока
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

  if (!playerData) {
    return (
      <div className="text-center py-12">
        <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">
          Профиль не найден
        </h2>
        <p className="text-gray-400 mb-4">
          Начни играть чтобы создать свой профиль!
        </p>
        <button
          onClick={loadPlayerData}
          className="px-6 py-2 bg-solana-purple text-white rounded-lg hover:bg-solana-purple/80 transition-colors"
        >
          Обновить профиль
        </button>
      </div>
    );
  }

  const achievements = getAchievements();
  const unlockedAchievements = achievements.filter(a => a.unlocked);
  // Вычисляем прогресс к следующему уровню
  const progressToNextLevel = (() => {
    if (currentLevel.level >= PLAYER_LEVELS.length) return 100; // Максимальный уровень
    
    const currentXP = xp || 0;
    const minXP = currentLevel.minXP || 0;
    const maxXP = currentLevel.maxXP || 50;
    
    const progress = ((currentXP - minXP) / (maxXP - minXP)) * 100;
    return Math.max(0, Math.min(100, progress));
  })();

  return (
    <div className="player-profile space-y-6">
      {/* Player Header */}
      <div className="cs2-card p-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-gradient-to-br from-solana-purple to-solana-green rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-white">
                {publicKey?.toString().slice(0, 8)}...{publicKey?.toString().slice(-4)}
              </h1>
              <div className={`px-3 py-1 rounded-full text-sm font-semibold ${currentLevel.color} bg-black/20 border border-current/30`}>
                <Crown className="w-4 h-4 inline mr-1" />
                {currentLevel.title} (Ур. {currentLevel.level})
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">
                  XP: {xp || 0} / {currentLevel.maxXP === 99999 ? '∞' : currentLevel.maxXP || 50}
                </span>
                <span className="text-gray-400">
                  {currentLevel.level >= PLAYER_LEVELS.length ? 'MAX' : `${Math.round(progressToNextLevel || 0)}%`}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-solana-purple to-solana-green h-2 rounded-full transition-all duration-500"
                  style={{ width: `${isNaN(progressToNextLevel) ? 0 : progressToNextLevel}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="cs2-card p-6 text-center">
          <Target className="w-8 h-8 text-cs2-orange mx-auto mb-3" />
          <div className="text-3xl font-bold text-cs2-orange mb-1">
            {playerData?.stats?.headshots || 0}
          </div>
          <div className="text-gray-400">Хедшотов</div>
        </div>

        <div className="cs2-card p-6 text-center">
          <Zap className="w-8 h-8 text-cs2-blue mx-auto mb-3" />
          <div className="text-3xl font-bold text-cs2-blue mb-1">
            {playerData?.stats?.kill_streaks || 0}
          </div>
          <div className="text-gray-400">Серий убийств</div>
        </div>

        <div className="cs2-card p-6 text-center">
          <TrendingUp className="w-8 h-8 text-solana-green mx-auto mb-3" />
          <div className="text-3xl font-bold text-solana-green mb-1">
            {playerData?.stats?.total_kills || 0}
          </div>
          <div className="text-gray-400">Всего убийств</div>
        </div>

      </div>

      {/* Achievements */}
      <div className="cs2-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <Award className="w-6 h-6 text-yellow-400" />
          <h3 className="text-xl font-semibold text-white">
            Достижения ({unlockedAchievements.length}/{achievements.length})
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement) => {
            const Icon = achievement.icon;
            return (
              <div 
                key={achievement.id}
                className={`p-4 rounded-lg border transition-all relative ${
                  achievement.unlocked 
                    ? 'bg-green-500/10 border-green-500/30' 
                    : 'bg-gray-500/10 border-gray-500/30'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Icon className={`w-6 h-6 ${achievement.unlocked ? 'text-green-400' : 'text-gray-400'}`} />
                  <div className="flex-1">
                    <h4 className={`font-semibold ${achievement.unlocked ? 'text-white' : 'text-gray-400'}`}>
                      {achievement.name}
                    </h4>
                    <p className="text-sm text-gray-400">{achievement.description}</p>
                  </div>
                  
                  {achievement.unlocked && (
                    <button
                      onClick={() => claimAchievement(achievement.id)}
                      disabled={claimingAchievement === achievement.id || (playerData?.claimed_achievements || []).includes(achievement.id)}
                      className={`text-xs font-semibold px-3 py-2 rounded transition-colors disabled:opacity-50 ${
                        (playerData?.claimed_achievements || []).includes(achievement.id)
                          ? 'text-green-400 bg-green-400/10 cursor-not-allowed'
                          : 'text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20'
                      }`}
                    >
                      {(playerData?.claimed_achievements || []).includes(achievement.id) 
                        ? '✅ ПОЛУЧЕНО' 
                        : claimingAchievement === achievement.id 
                          ? '⏳' 
                          : '🪙 ЗАБРАТЬ'
                      }
                    </button>
                  )}
                </div>
                
                {achievement.progress !== undefined && achievement.maxProgress && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">Прогресс</span>
                      <span className="text-gray-400">
                        {achievement.progress}/{achievement.maxProgress}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1">
                      <div 
                        className={`h-1 rounded-full transition-all duration-500 ${
                          achievement.unlocked ? 'bg-green-400' : 'bg-gray-500'
                        }`}
                        style={{ 
                          width: `${Math.min((achievement.progress / achievement.maxProgress) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                )}
                
              </div>
            );
          })}
        </div>
      </div>


      {/* Recent Activity */}
      <div className="cs2-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Последняя активность
        </h3>
        
        {playerData.recent_achievements && playerData.recent_achievements.length > 0 ? (
          <div className="space-y-3">
            {playerData.recent_achievements.slice(0, 5).map((activity: any, index: number) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-black/20 rounded-lg">
                {activity.type === 'achievement_claim' ? (
                  <Award className="w-5 h-5 text-yellow-400" />
                ) : activity.type === 'headshot' ? (
                  <Target className="w-5 h-5 text-cs2-orange" />
                ) : (
                  <Zap className="w-5 h-5 text-cs2-blue" />
                )}
                <div className="flex-1">
                  <div className="text-white font-medium">
                    {activity.type === 'achievement_claim' 
                      ? `🏆 Достижение получено: ${activity.achievement_data?.achievement_name || getAchievementName(activity.achievement_data?.achievement_id) || 'Специальное достижение'}`
                      : activity.type === 'headshot' 
                        ? 'Хедшот токен получен' 
                        : `Серия из ${activity.streak_count} убийств`
                    }
                  </div>
                  {activity.map && activity.type !== 'achievement_claim' && (
                    <div className="text-sm text-gray-400">
                      Карта: {activity.map}
                    </div>
                  )}
                  {activity.type === 'achievement_claim' && (
                    <div className="text-sm text-green-400">
                      SKILLS токен зачислен на кошелёк
                    </div>
                  )}
                </div>
                <div className="text-sm text-gray-400">
                  {new Date(activity.timestamp).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <Star className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Пока нет активности. Начни играть!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerProfile;
