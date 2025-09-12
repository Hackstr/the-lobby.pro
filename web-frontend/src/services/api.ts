import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'; // Will be configurable in production

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Player API
export const registerPlayer = async (walletAddress: string) => {
  return api.post('/api/players/register', {
    wallet_address: walletAddress,
  });
};

export const getPlayerDashboard = async (walletAddress: string) => {
  return api.get(`/api/players/${walletAddress}/dashboard`);
};

export const processAchievement = async (
  walletAddress: string,
  achievementType: 'headshot' | 'kill_streak',
  achievementData: any
) => {
  return api.post('/api/players/achievement', {
    wallet_address: walletAddress,
    achievement_type: achievementType,
    achievement_data: achievementData,
  });
};

// Gaming API
export const getServers = async () => {
  return api.get('/api/gaming/servers');
};

export const getServerStatus = async (serverId: string) => {
  return api.get(`/api/gaming/servers/${serverId}`);
};

export const simulateKillEvent = async (playerId: string, eventType: string) => {
  return api.post('/api/gaming/simulate-kill', {
    player_id: playerId,
    event_type: eventType,
  });
};

export default api;
