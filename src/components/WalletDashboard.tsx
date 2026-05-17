'use client';
import React, { useState } from 'react';
import { InventoryItem, CurrencyType } from '@/lib/gameTypes';
import { playClickSound } from './SoundManager';
import { Wallet, LayoutDashboard, Package, ArrowRightLeft, Download, Upload, Clock } from 'lucide-react';
import OverviewTab from './wallet/OverviewTab';
import InventoryTab from './wallet/InventoryTab';
import ExchangeTab from './wallet/ExchangeTab';
import DepositTab from './wallet/DepositTab';
import WithdrawTab from './wallet/WithdrawTab';
import HistoryTab from './wallet/HistoryTab';

interface WalletDashboardProps {
  items: InventoryItem[];
  onRepairItem: (item: InventoryItem) => void;
  playerCoins: number;
  playerGems: number;
  playerUsdt: number;
  onExchange: (from: CurrencyType, to: CurrencyType, fromAmount: number, toAmount: number) => void;
  onTopUp?: (amount: number) => void;
}

const WALLET_TABS = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'inventory', label: 'Inventory', icon: Package },
  { key: 'exchange', label: 'Exchange', icon: ArrowRightLeft },
  { key: 'deposit', label: 'Deposit', icon: Download },
  { key: 'withdraw', label: 'Withdraw', icon: Upload },
  { key: 'history', label: 'History', icon: Clock },
] as const;

type WalletTabKey = typeof WALLET_TABS[number]['key'];

export default function WalletDashboard({ items, onRepairItem, playerCoins, playerGems, playerUsdt, onExchange, onTopUp }: WalletDashboardProps) {
  const [activeTab, setActiveTab] = useState<WalletTabKey>('overview');
  const totalItems = items.reduce((acc, i) => acc + i.quantity, 0);

  const handleGoToTab = (tab: string) => {
    playClickSound();
    setActiveTab(tab as WalletTabKey);
  };

  return (
    <div className="flex flex-col gap-5 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text flex items-center justify-center gap-3"
          style={{ backgroundImage: 'linear-gradient(135deg, #a5f3fc, #a3e635, #fde68a)' }}>
          <Wallet size={26} className="text-teal-400" />
          Wallet
        </h2>
        <p className="text-xs text-slate-500 mt-1.5">
          Manage your game assets, crypto balance, and inventory
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1.5 justify-center flex-wrap sm:flex-nowrap overflow-x-auto pb-1 custom-scrollbar">
        {WALLET_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => { playClickSound(); setActiveTab(tab.key); }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer hover:scale-105 active:scale-95 whitespace-nowrap shrink-0"
              style={{
                background: isActive
                  ? 'linear-gradient(135deg, rgba(34,211,238,0.2), rgba(34,211,238,0.08))'
                  : 'rgba(15,23,42,0.6)',
                border: isActive
                  ? '1px solid rgba(34,211,238,0.5)'
                  : '1px solid rgba(100,116,139,0.15)',
                color: isActive ? '#67e8f9' : '#94a3b8',
                boxShadow: isActive ? '0 0 16px rgba(34,211,238,0.1)' : 'none',
              }}
            >
              <tab.icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-teal-500/20 to-transparent" />

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <OverviewTab
          playerCoins={playerCoins}
          playerGems={playerGems}
          playerUsdt={playerUsdt}
          totalItems={totalItems}
          onGoToTab={handleGoToTab}
        />
      )}
      {activeTab === 'inventory' && (
        <InventoryTab items={items} onRepairItem={onRepairItem} playerCoins={playerCoins} />
      )}
      {activeTab === 'exchange' && (
        <ExchangeTab coins={playerCoins} gems={playerGems} usdt={playerUsdt} onExchange={onExchange} />
      )}
      {activeTab === 'deposit' && (
        <DepositTab playerUsdt={playerUsdt} onTopUp={onTopUp} />
      )}
      {activeTab === 'withdraw' && (
        <WithdrawTab playerUsdt={playerUsdt} />
      )}
      {activeTab === 'history' && (
        <HistoryTab />
      )}
    </div>
  );
}
