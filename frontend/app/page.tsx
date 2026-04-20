'use client';

import React, { useState, useEffect, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, Shield, Activity, ArrowUpRight, Zap } from 'lucide-react';
import { getVaultStats, deposit } from '@/lib/stellar';
import WalletModal from '@/components/wallet-modal';
import ActivityFeed from '@/components/activity-feed';

export default function Dashboard() {
  const [stats, setStats] = useState({ tvl: '0', sharePrice: '0', apy: '0' });
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositLogs, setDepositLogs] = useState<string[]>([]);

  useEffect(() => {
    getVaultStats().then(setStats);
  }, []);

  const handleConnect = () => {
    setIsModalOpen(true);
  };

  const appendDepositLog = (message: string) => {
    const entry = `${new Date().toLocaleTimeString()} - ${message}`;
    console.log(`[deposit] ${entry}`);
    setDepositLogs((prev) => [entry, ...prev].slice(0, 8));
  };

  const handleDeposit = async () => {
    appendDepositLog('Deposit button clicked');

    if (!userAddress) {
      appendDepositLog('No wallet connected. Please connect first.');
      return;
    }

    const amount = Number(depositAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      appendDepositLog(`Invalid amount: "${depositAmount}"`);
      return;
    }

    try {
      setIsDepositing(true);
      appendDepositLog(`Submitting deposit tx for ${amount} USDC`);
      const result = await deposit(userAddress, amount);
      appendDepositLog(`Transaction submitted: ${JSON.stringify(result)}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown deposit error';
      appendDepositLog(`Deposit failed: ${message}`);
      console.error('[deposit] full error', error);
    } finally {
      setIsDepositing(false);
    }
  };

  return (
    <main className="min-h-screen bg-grid p-4 md:p-8">
      <WalletModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onConnected={(addr) => setUserAddress(addr)} 
      />
      {/* Navbar */}
      <nav className="flex justify-between items-center mb-12 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#10b981] rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)]">
            <Shield className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight">Stellar<span className="text-[#10b981]">Vault</span></span>
        </div>
        <button 
          onClick={handleConnect}
          className="glass px-6 py-2 flex items-center gap-2 hover:bg-white/10 transition-all font-medium"
        >
          <Wallet className="w-4 h-4" />
          {userAddress ? `${userAddress.slice(0, 4)}...${userAddress.slice(-4)}` : 'Connect Wallet'}
        </button>
      </nav>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Stats */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard title="Total Value Locked" value={stats.tvl} icon={<TrendingUp className="text-[#10b981]" />} />
            <StatCard title="Share Price" value={stats.sharePrice} icon={<Zap className="text-[#8b5cf6]" />} />
            <StatCard title="Current APY" value={stats.apy} icon={<Activity className="text-[#3b82f6]" />} color="text-[#10b981]" />
          </div>

          {/* Chart Placeholder / Main View */}
          <div className="glass h-80 flex flex-col items-center justify-center border-white/5 relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-[#10b981]/5 to-transparent pointer-events-none" />
             <Activity className="w-12 h-12 text-[#10b981]/20 mb-4" />
             <p className="text-white/40 font-medium">Vault Performance (Coming Soon)</p>
          </div>
        </div>

        {/* Action Panel */}
        <div className="space-y-6">
          <div className="glass p-6 border-[#10b981]/20 shadow-[0_0_30px_rgba(16,185,129,0.05)]">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <ArrowUpRight className="text-[#10b981]" />
              Deposit Assets
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-white/50 mb-2 block">Amount to Deposit</label>
                <div className="relative">
                  <input 
                    type="number" 
                    placeholder="0.00"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-4 focus:outline-none focus:border-[#10b981]/50 transition-all text-xl font-semibold"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-white/30">USDC</span>
                </div>
              </div>
              <button
                onClick={handleDeposit}
                disabled={isDepositing}
                className="w-full bg-[#10b981] hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-[#10b981]/20 transition-all transform active:scale-95"
              >
                {isDepositing ? 'Submitting deposit...' : 'Deposit into Vault'}
              </button>
              <p className="text-xs text-center text-white/30">
                Gas fees optimized. Minimum deposit: 10 USDC.
              </p>
              <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                <p className="text-[10px] uppercase tracking-wider text-white/40 mb-2">Local Deposit Logs</p>
                <div className="space-y-1 max-h-32 overflow-auto">
                  {depositLogs.length === 0 ? (
                    <p className="text-xs text-white/40">No logs yet. Click deposit to test flow.</p>
                  ) : (
                    depositLogs.map((log) => (
                      <p key={log} className="text-xs font-mono text-white/70 break-words">
                        {log}
                      </p>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Activity Mini-feed */}
          <div className="glass p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white/40 mb-4">Live Activity</h3>
            <ActivityFeed />
          </div>
        </div>
      </div>
    </main>
  );
}

type StatCardProps = {
  title: string;
  value: string;
  icon: ReactNode;
  color?: string;
};

function StatCard({ title, value, icon, color = "text-white" }: StatCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-6"
    >
      <div className="flex justify-between items-start mb-4">
        <span className="text-sm font-medium text-white/50">{title}</span>
        <div className="p-2 bg-white/5 rounded-lg">{icon}</div>
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </motion.div>
  );
}
