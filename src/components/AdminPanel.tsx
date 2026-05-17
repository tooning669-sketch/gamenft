'use client';
import React, { useState } from 'react';
import AdminSidebar, { AdminTab } from './admin/AdminSidebar';
import AdminOverview from './admin/AdminOverview';
import GameSettingsTab from './admin/GameSettingsTab';
import BallTiersTab from './admin/BallTiersTab';
import RewardsTab from './admin/RewardsTab';
import ExchangeTab from './admin/ExchangeTab';
import GunsTab from './admin/GunsTab';
import CardsTab from './admin/CardsTab';
import MarketplaceTab from './admin/MarketplaceTab';
import AmmoTab from './admin/AmmoTab';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  const renderTab = () => {
    switch (activeTab) {
      case 'overview': return <AdminOverview />;
      case 'game-settings': return <GameSettingsTab />;
      case 'ball-tiers': return <BallTiersTab />;
      case 'rewards': return <RewardsTab />;
      case 'exchange': return <ExchangeTab />;
      case 'guns': return <GunsTab />;
      case 'cards': return <CardsTab />;
      case 'marketplace': return <MarketplaceTab />;
      case 'ammo': return <AmmoTab />;
      default: return <AdminOverview />;
    }
  };

  return (
    <div className="h-screen flex relative z-10 overflow-hidden">
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8">
        {renderTab()}
      </main>
    </div>
  );
}
