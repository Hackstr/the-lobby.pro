import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Server, BarChart3, Github } from 'lucide-react';
import WalletManager from './WalletManager';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Servers', href: '/servers', icon: Server },
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  ];

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-solana-purple to-solana-green rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">L</span>
              </div>
              <div>
                <h1 className="text-xl font-gaming font-bold text-white">
                  The Lobby.Sol
                </h1>
                <p className="text-xs text-gray-400">CS2 Gaming Tokens</p>
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
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      isActive(item.href)
                        ? 'bg-solana-purple/20 text-solana-purple border border-solana-purple/30'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/20 backdrop-blur-sm mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-gray-400 text-sm">
                Built for the Solana Hackathon 2024
              </p>
              <p className="text-gray-500 text-xs">
                Tokenizing CS2 achievements on Solana blockchain
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/your-repo"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <Github className="w-4 h-4" />
                <span className="text-sm">View Source</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
