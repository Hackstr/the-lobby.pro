import React from 'react';
import PlayerProfile from '../components/PlayerProfile';
import DemoControls from '../components/DemoControls';

const ProfilePage: React.FC = () => {
  return (
    <div className="profile-page">
      <div className="mb-8">
        <h1 className="text-3xl font-gaming font-bold text-white mb-2">
          Профиль игрока
        </h1>
        <p className="text-gray-400">
          Твоя статистика, достижения и прогресс в The Lobby.Sol
        </p>
      </div>
      
      <div className="space-y-6">
        <DemoControls />
        <PlayerProfile />
      </div>
    </div>
  );
};

export default ProfilePage;
