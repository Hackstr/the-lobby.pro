import React from 'react';
import PlayerProfile from '../components/PlayerProfile';
import DemoControls from '../components/DemoControls';

const ProfilePage: React.FC = () => {
  return (
    <div className="profile-page">
      <div className="mb-8">
        <h1 className="text-3xl font-mono font-bold mb-2">
          Профиль игрока
        </h1>
        <p className="text-[color:var(--brand-text)]/70">
          Твоя статистика, достижения и прогресс в The-lobby.pro
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
