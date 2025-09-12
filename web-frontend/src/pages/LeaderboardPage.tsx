import React from 'react';
import Leaderboard from '../components/Leaderboard';

const LeaderboardPage: React.FC = () => {
  return (
    <div className="leaderboard-page">
      <div className="mb-8">
        <h1 className="text-3xl font-gaming font-bold text-white mb-2">
          Leaderboard
        </h1>
        <p className="text-gray-400">
          Топ игроки The Lobby.Sol по XP, хедшотам и сериям убийств
        </p>
      </div>
      
      <Leaderboard />
    </div>
  );
};

export default LeaderboardPage;
