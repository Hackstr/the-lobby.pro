// Легкий клиент поверх native fetch (без axios)

// Определяем API URL с правильным fallback для продакшена
const API_BASE_URL = (() => {
  if (import.meta.env?.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (import.meta.env?.MODE === 'development') return 'http://localhost:4000';
  return 'https://thelobby-sol-api.fly.dev';
})();

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

async function request<T>(path: string, options: { method?: HttpMethod; body?: unknown } = {}): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const { method = 'GET', body } = options;

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    // Кросс-домен без куков, чтобы не ломать CORS
    credentials: 'omit',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`);
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return (await res.json()) as T;
  return undefined as unknown as T;
}

// Player API
export const registerPlayer = async (walletAddress: string) =>
  request('/api/players/register', {
    method: 'POST',
    body: { wallet_address: walletAddress },
  });

export const getPlayerDashboard = async (walletAddress: string) =>
  request(`/api/players/${walletAddress}/dashboard`);

export const processAchievement = async (
  walletAddress: string,
  achievementType: 'headshot' | 'kill_streak',
  achievementData: any
) =>
  request('/api/players/achievement', {
    method: 'POST',
    body: {
      wallet_address: walletAddress,
      achievement_type: achievementType,
      achievement_data: achievementData,
    },
  });

// Gaming API
export const getServers = async () => request('/api/gaming/servers');

export const getServerStatus = async (serverId: string) =>
  request(`/api/gaming/servers/${serverId}`);

export const simulateKillEvent = async (playerId: string, eventType: string) =>
  request('/api/gaming/simulate-kill', {
    method: 'POST',
    body: { player_id: playerId, event_type: eventType },
  });

export { request };
export default { request };
