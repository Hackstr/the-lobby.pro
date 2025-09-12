import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Wallet, Zap } from 'lucide-react';

const WalletManager: React.FC = () => {
  const { connected, publicKey } = useWallet();

  return (
    <div className="wallet-manager">
      <div className="flex items-center gap-4">
        {connected && publicKey ? (
          <div className="flex items-center gap-3 bg-gradient-to-r from-solana-purple/20 to-solana-green/20 px-4 py-2 rounded-lg border border-solana-purple/30">
            <Zap className="w-5 h-5 text-solana-green" />
            <div className="text-sm">
              <div className="text-gray-300">Connected:</div>
              <div className="font-mono text-xs text-white">
                {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-gray-400">
            <Wallet className="w-5 h-5" />
            <span className="text-sm">Not Connected</span>
          </div>
        )}
        
        <WalletMultiButton className="!bg-gradient-to-r !from-solana-purple !to-solana-green" />
      </div>
    </div>
  );
};

export default WalletManager;
