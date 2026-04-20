'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Zap, Globe } from 'lucide-react';
import { connectToWallet } from '@/lib/stellar';

const WALLETS = [
  { id: 'freighter', name: 'Freighter', icon: <ShieldCheck className="text-[#10b981]" />, desc: 'Recommended for Desktop' },
  { id: 'albedo', name: 'Albedo', icon: <Globe className="text-[#3b82f6]" />, desc: 'Web-based browser wallet' },
  { id: 'xbull', name: 'xBull', icon: <Zap className="text-[#8b5cf6]" />, desc: 'Advanced power users' },
];

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected: (address: string) => void;
}

export default function WalletModal({ isOpen, onClose, onConnected }: WalletModalProps) {
  if (!isOpen) return null;

  const handleSelect = async (walletId: string) => {
    try {
      const addr = await connectToWallet(walletId);
      if (addr) {
        onConnected(addr);
        onClose();
      }
    } catch (error) {
      console.error("Selection error:", error);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="glass w-full max-w-md overflow-hidden border-white/10 shadow-2xl"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h2 className="text-xl font-bold tracking-tight text-white">Connect Wallet</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-all group">
              <X className="w-5 h-5 text-white/40 group-hover:text-white" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3">
            {WALLETS.map((wallet) => (
              <button
                key={wallet.id}
                onClick={() => handleSelect(wallet.id)}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-[#10b981]/30 hover:bg-[#10b981]/5 transition-all group text-left relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#10b981]/0 to-[#10b981]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform relative z-10">
                  {wallet.icon}
                </div>
                <div className="relative z-10">
                  <div className="font-bold text-lg text-white group-hover:text-[#10b981] transition-colors">{wallet.name}</div>
                  <div className="text-xs text-white/40">{wallet.desc}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="p-6 bg-white/5 text-center">
            <p className="text-[10px] uppercase tracking-widest text-white/20 font-bold mb-2">Secure Connection</p>
            <p className="text-xs text-white/30">
              New to Stellar? <a href="https://www.stellar.org/learn/wallets" target="_blank" className="text-[#10b981] hover:underline">Get a wallet here</a>
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
