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
          <div className="flex items-center gap-3 px-4 py-2 rounded-lg border border-[color:var(--brand-accent)]/30 bg-[color:var(--brand-accent)]/10">
            <Zap className="w-5 h-5 text-[color:var(--brand-accent)]" />
            <div className="text-sm">
              <div className="text-[color:var(--brand-text)]/60">Connected:</div>
              <div className="font-mono text-xs">
                {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-[color:var(--brand-text)]/60 border border-[color:var(--brand-border)] px-3 py-2 rounded-lg bg-white">
            <Wallet className="w-5 h-5 text-[color:var(--brand-accent)]" />
            <span className="text-sm">Not Connected</span>
          </div>
        )}

        <WalletMultiButton className="!bg-[color:var(--brand-accent)] !text-white !px-4 !py-2 !rounded-lg hover:!opacity-90" />
      </div>
    </div>
  );
};

export default WalletManager;
