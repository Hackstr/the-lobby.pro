import React from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { Target, Zap, Trophy, ArrowRight, Play } from 'lucide-react';

const HomePage: React.FC = () => {
  const { connected } = useWallet();

  const features = [
    {
      icon: Target,
      title: 'Headshot Tokens',
      description: 'Earn NFT tokens for every headshot kill in CS2',
      color: 'text-cs2-orange',
    },
    {
      icon: Zap,
      title: 'Streak Rewards',
      description: 'Get special tokens for 10+ kill streaks',
      color: 'text-cs2-blue',
    },
    {
      icon: Trophy,
      title: 'Blockchain Verified',
      description: 'All achievements stored as NFTs on Solana',
      color: 'text-solana-purple',
    },
  ];

  return (
    <div className="homepage">
      {/* Hero Section */}
      <div className="text-center py-16">
        <h1 className="text-5xl md:text-6xl font-gaming font-black text-white mb-6">
          <span className="bg-gradient-to-r from-cs2-orange via-cs2-blue to-solana-purple bg-clip-text text-transparent">
            The Lobby.Sol
          </span>
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Turn your Counter-Strike 2 skills into valuable NFT tokens. 
          Every headshot, every streak - tokenized on Solana blockchain.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {connected ? (
            <>
              <Link
                to="/servers"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cs2-orange to-cs2-blue text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cs2-orange/25 transition-all duration-300"
              >
                <Play className="w-5 h-5" />
                Browse Servers
              </Link>
              <Link
                to="/profile"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-solana-purple to-solana-green text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-solana-purple/25 transition-all duration-300"
              >
                <Trophy className="w-5 h-5" />
                View Profile
              </Link>
            </>
          ) : (
            <div className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold rounded-lg">
              Connect wallet to get started
            </div>
          )}
        </div>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-8 py-16">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div key={index} className="cs2-card p-8 text-center">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-black/20 to-black/40 mb-6`}>
                <Icon className={`w-8 h-8 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-300">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* How It Works */}
      <div className="py-16">
        <h2 className="text-3xl font-gaming font-bold text-white text-center mb-12">
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
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-solana-purple to-solana-green text-white font-bold rounded-full mb-4">
                {item.step}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {item.title}
              </h3>
              <p className="text-gray-400 text-sm">
                {item.desc}
              </p>
              {index < 3 && (
                <ArrowRight className="w-5 h-5 text-gray-600 mx-auto mt-4 hidden md:block" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="cs2-card p-8 text-center">
        <h2 className="text-2xl font-gaming font-bold text-white mb-8">
          Platform Stats
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="text-3xl font-bold text-cs2-orange mb-2">1,337</div>
            <div className="text-gray-400">Headshot Tokens</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-cs2-blue mb-2">420</div>
            <div className="text-gray-400">Streak Tokens</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-solana-green mb-2">69</div>
            <div className="text-gray-400">Active Players</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-solana-purple mb-2">24/7</div>
            <div className="text-gray-400">Servers Online</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
