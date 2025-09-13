import React from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useEffect, useState } from 'react';
import { request } from '../services/api';
import { Target, Zap, Trophy, ArrowRight, Play } from 'lucide-react';

const HomePage: React.FC = () => {
  const { connected } = useWallet();

  const features = [
    {
      icon: Target,
      title: 'Headshot Tokens',
      description: 'Earn NFT tokens for every headshot kill in CS2',
      color: 'text-[color:var(--brand-accent)]',
    },
    {
      icon: Zap,
      title: 'Streak Rewards',
      description: 'Get special tokens for 10+ kill streaks',
      color: 'text-[color:var(--brand-accent)]',
    },
    {
      icon: Trophy,
      title: 'Blockchain Verified',
      description: 'All achievements stored as NFTs on Solana',
      color: 'text-[color:var(--brand-accent)]',
    },
  ];

  // Platform stats state
  const [stats, setStats] = useState<any | null>(null);
  useEffect(() => {
    const load = async () => {
      try {
        const res: any = await request('/api/platform/stats');
        setStats(res?.data || res);
      } catch (e) {
        // noop – оставим дефолтные цифры
      }
    };
    load();
  }, []);

  return (
    <div className="homepage">
      {/* Hero Section */}
      <div className="text-center py-16">
        <h1 className="text-5xl md:text-7xl font-mono font-black tracking-tight mb-4 text-[color:var(--brand-text)]">
          The-lobby.pro
        </h1>
        <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-[color:var(--brand-text)]/80 leading-relaxed">
          Turn your Counter‑Strike 2 skills into valuable tokens. Earn on every headshot and kill‑streak — on Solana.
        </p>
        
        {/* CTA‑кнопки в хиро убраны по просьбе. Основные CTA ниже на странице. */}
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-8 py-16">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div key={index} className="cs2-card p-8 text-center">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-[color:var(--brand-accent)]/10 mb-6`}>
                <Icon className={`w-8 h-8 text-[color:var(--brand-accent)]`} />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                {feature.title}
              </h3>
              <p className="text-[color:var(--brand-text)]/70">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Social Proof mini-strip – убрано по просьбе */}

      {/* How It Works */}
      <div className="py-16">
        <h2 className="text-3xl font-mono font-bold text-center mb-12">
          How It Works
        </h2>
        
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { step: '1', title: 'Connect Wallet', desc: 'Link your Phantom wallet to the platform' },
            { step: '2', title: 'Join Server', desc: 'Browse and join CS2 servers' },
            { step: '3', title: 'Play & Earn', desc: 'Get headshots and streaks' },
            { step: '4', title: 'Collect NFTs', desc: 'Tokens minted to your wallet' },
          ].map((item, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-[color:var(--brand-accent)] text-white font-bold rounded-full mb-4">
                {item.step}
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {item.title}
              </h3>
              <p className="text-[color:var(--brand-text)]/60 text-sm">
                {item.desc}
              </p>
              {index < 3 && (
                <ArrowRight className="w-5 h-5 text-[color:var(--brand-text)]/40 mx-auto mt-4 hidden md:block" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Stats – динамика с API */}
      <div className="cs2-card p-8 text-center">
        <h2 className="text-2xl font-mono font-bold mb-8">Platform Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="text-3xl font-bold text-[color:var(--brand-accent)] mb-2">{stats?.total_headshots ?? '—'}</div>
            <div className="text-[color:var(--brand-text)]/60">Headshots</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-[color:var(--brand-accent)] mb-2">{stats?.total_kill_streaks ?? '—'}</div>
            <div className="text-[color:var(--brand-text)]/60">Streaks</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-[color:var(--brand-accent)] mb-2">{stats?.total_players ?? '—'}</div>
            <div className="text-[color:var(--brand-text)]/60">Active Players</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-[color:var(--brand-accent)] mb-2">{stats ? `${stats.servers_online}/${stats.total_servers}` : '—'}</div>
            <div className="text-[color:var(--brand-text)]/60">Servers Online</div>
          </div>
        </div>
      </div>

      {/* Unified CTA */}
      <div className="cs2-card p-10 text-center mt-8">
        <h3 className="text-2xl font-mono font-bold mb-3">Ready to earn on your skills?</h3>
        <p className="text-[color:var(--brand-text)]/70 mb-6">Connect your wallet and jump into a server. Rewards start instantly.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {connected ? (
            <>
              <Link
                to="/servers"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[color:var(--brand-accent)] text-white font-semibold rounded-lg hover:opacity-90 transition-all duration-200"
              >
                <Play className="w-5 h-5" />
                Browse Servers
              </Link>
              <Link
                to="/profile"
                className="inline-flex items-center gap-2 px-8 py-4 border border-[color:var(--brand-border)] bg-white text-[color:var(--brand-text)] font-semibold rounded-lg hover:bg-black/5 transition-all duration-200"
              >
                <Trophy className="w-5 h-5" />
                View Profile
              </Link>
            </>
          ) : (
            <>
              <WalletMultiButton className="!bg-[color:var(--brand-accent)] !text-white !px-8 !py-4 !rounded-lg hover:!opacity-90" />
              <Link
                to="/servers"
                className="inline-flex items-center gap-2 px-8 py-4 border border-[color:var(--brand-border)] bg-white text-[color:var(--brand-text)] font-semibold rounded-lg hover:bg-black/5 transition-all duration-200"
              >
                <Play className="w-5 h-5" />
                Browse Servers
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
