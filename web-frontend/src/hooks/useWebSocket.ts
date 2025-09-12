import { useEffect, useRef, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import toast from 'react-hot-toast';

// interface WebSocketMessage {
//   event: string;
//   payload: any;
// }

interface Achievement {
  type: string;
  achievement: any;
  xp_gained?: number;
  streak_count?: number;
}

export const useWebSocket = () => {
  const { connected, publicKey } = useWallet();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (connected && publicKey) {
      connectWebSocket();
    } else {
      disconnectWebSocket();
    }

    return () => {
      disconnectWebSocket();
    };
  }, [connected, publicKey]);

  const connectWebSocket = () => {
    if (!publicKey) return;

    // Temporarily disable WebSocket for stable demo
    console.log('WebSocket temporarily disabled for stable demo');
    setIsConnected(false);
    return;

    try {
      const wsUrl = `ws://localhost:4000/socket/websocket`;
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        
        // Join player channel
        const joinMessage = {
          topic: `game:player:${publicKey?.toString()}`,
          event: 'phx_join',
          payload: {},
          ref: Date.now().toString()
        };
        
        ws.send(JSON.stringify(joinMessage));
        
        // Join lobby channel for global events
        const lobbyJoinMessage = {
          topic: 'game:lobby',
          event: 'phx_join', 
          payload: {},
          ref: (Date.now() + 1).toString()
        };
        
        ws.send(JSON.stringify(lobbyJoinMessage));
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleWebSocketMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        
        // Reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          if (connected && publicKey) {
            connectWebSocket();
          }
        }, 3000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

      setSocket(ws);
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  };

  const disconnectWebSocket = () => {
    if (socket) {
      socket.close();
      setSocket(null);
    }
    setIsConnected(false);
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
  };

  const handleWebSocketMessage = (message: any) => {
    if (message.event === 'achievement_earned') {
      const achievement = message.payload as Achievement;
      setAchievements(prev => [achievement, ...prev.slice(0, 9)]); // Keep last 10
      
      // Show toast notification
      if (achievement.type === 'headshot') {
        toast.success(`🎯 Хедшот токен получен! +${achievement.xp_gained} XP`, {
          duration: 4000,
          icon: '🎯',
        });
      } else if (achievement.type === 'kill_streak') {
        toast.success(`⚡ Серия из ${achievement.streak_count}! +${achievement.xp_gained} XP`, {
          duration: 4000,
          icon: '⚡',
        });
      }
    } else if (message.event === 'player_achievement') {
      // Global achievement notification
      const payload = message.payload;
      if (payload.wallet_address !== publicKey?.toString()) {
        toast(`🏆 Игрок получил ${payload.type === 'headshot' ? 'хедшот' : 'серию'}!`, {
          duration: 2000,
          style: {
            background: 'rgba(153, 69, 255, 0.1)',
            border: '1px solid rgba(153, 69, 255, 0.3)',
          },
        });
      }
    }
  };

  const simulateHeadshot = () => {
    if (!socket || !publicKey) return;
    
    const message = {
      topic: `game:player:${publicKey.toString()}`,
      event: 'simulate_headshot',
      payload: {
        wallet_address: publicKey.toString()
      },
      ref: Date.now().toString()
    };
    
    socket.send(JSON.stringify(message));
  };

  const simulateKillStreak = (streakCount: number = 10) => {
    if (!socket || !publicKey) return;
    
    const message = {
      topic: `game:player:${publicKey.toString()}`,
      event: 'simulate_kill_streak',
      payload: {
        wallet_address: publicKey.toString(),
        streak_count: streakCount
      },
      ref: Date.now().toString()
    };
    
    socket.send(JSON.stringify(message));
  };

  return {
    isConnected,
    achievements,
    simulateHeadshot,
    simulateKillStreak,
  };
};
