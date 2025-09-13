import React from 'react';
import Leaderboard from '../components/Leaderboard';

const LeaderboardPage: React.FC = () => {
  return (
    <div className="leaderboard-page">
      <div className="mb-8">
        <h1 className="text-3xl font-mono font-bold mb-2">
          Leaderboard
        </h1>
        <p className="text-[color:var(--brand-text)]/70">
          Топ игроки The-lobby.pro по XP, хедшотам и сериям убийств
        </p>
      </div>
      
      <Leaderboard />
    </div>
  );
};

export default LeaderboardPage;
