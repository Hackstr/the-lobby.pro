import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Server, User, Trophy } from 'lucide-react';
import WalletManager from './WalletManager';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Servers', href: '/servers', icon: Server },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
  ];

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  return (
    <div className="min-h-screen bg-[color:var(--brand-bg)] text-[color:var(--brand-text)] flex flex-col">
      {/* Header */}
      <header className="border-b border-[color:var(--brand-border)] bg-white/70 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center border border-[color:var(--brand-border)]">
                <span className="text-[color:var(--brand-accent)] font-bold text-xl">L</span>
              </div>
              <div>
                <h1 className="text-xl font-mono font-bold text-[color:var(--brand-text)]">The-lobby.pro</h1>
                <p className="text-xs text-[color:var(--brand-text)]/60">CS2 Gaming Tokens</p>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors border ${
                      isActive(item.href)
                        ? 'border-[color:var(--brand-accent)] text-[color:var(--brand-accent)] bg-[color:var(--brand-accent)]/10'
                        : 'border-transparent text-[color:var(--brand-text)]/70 hover:text-[color:var(--brand-text)] hover:bg-black/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Wallet */}
            <WalletManager />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-[color:var(--brand-border)] bg-white/70 backdrop-blur-sm mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-center items-center">
            <p className="text-[color:var(--brand-text)]/70 text-sm text-center">
              Built for the Solana Day powered by DECENTRATHON Hackathon 2025
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
