import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Player API
export const registerPlayer = async (walletAddress: string) => {
  return api.post('/players/register', {
    wallet_address: walletAddress,
  });
};

export const getPlayerDashboard = async (walletAddress: string) => {
  return api.get(`/players/${walletAddress}/dashboard`);
};

export const processAchievement = async (
  walletAddress: string,
  achievementType: 'headshot' | 'kill_streak',
  achievementData: any
) => {
  return api.post('/players/achievement', {
    wallet_address: walletAddress,
    achievement_type: achievementType,
    achievement_data: achievementData,
  });
};

// Gaming API
export const getServers = async () => {
  return api.get('/gaming/servers');
};

export const getServerStatus = async (serverId: string) => {
  return api.get(`/gaming/servers/${serverId}`);
};

export const simulateKillEvent = async (playerId: string, eventType: string) => {
  return api.post('/gaming/simulate-kill', {
    player_id: playerId,
    event_type: eventType,
  });
};

export default api;
