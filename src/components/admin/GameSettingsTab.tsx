'use client';
import React, { useState, useEffect } from 'react';
import { GRID_ROWS, GRID_COLS } from '@/lib/gameTypes';
import { fetchConfig, saveConfig } from '@/lib/adminApi';
import { Save, RotateCcw, Loader2 } from 'lucide-react';

const DEFAULTS = {
  gridRows: GRID_ROWS,
  gridCols: GRID_COLS,
  roundTimer: 30,
  startCost: 500,
  maxRoundsPerGun: 4,
  energyCooldownHours: 4,
};

function Field({ label, value, onChange, suffix }: { label: string; value: number; onChange: (v: number) => void; suffix?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 px-4 rounded-xl bg-slate-800/40 border border-slate-700/20">
      <label className="text-sm font-medium text-slate-300">{label}</label>
      <div className="flex items-center gap-2">
        <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))}
          className="w-24 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-600/30 text-teal-200 text-sm text-right focus:outline-none focus:border-teal-500/50" />
        {suffix && <span className="text-xs text-slate-500">{suffix}</span>}
      </div>
    </div>
  );
}

export default function GameSettingsTab() {
  const [settings, setSettings] = useState(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConfig().then((cfg) => {
      if (cfg.game_settings) setSettings(cfg.game_settings as typeof DEFAULTS);
    }).finally(() => setLoading(false));
  }, []);

  const update = (key: keyof typeof DEFAULTS, val: number) => {
    setSettings((p) => ({ ...p, [key]: val }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveConfig('game_settings', settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) { alert('Save failed: ' + (e as Error).message); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center gap-2 text-slate-400 p-8"><Loader2 size={20} className="animate-spin" /> Loading...</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text"
          style={{ backgroundImage: 'linear-gradient(135deg, #a5f3fc, #22d3ee)' }}>Game Settings</h1>
        <p className="text-sm text-slate-400 mt-1">Configure core gameplay parameters • <span className="text-teal-400">Synced to Turso DB</span></p>
      </div>

      <div className="glass-card p-6 space-y-3">
        <h3 className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-2">Grid Configuration</h3>
        <Field label="Rows" value={settings.gridRows} onChange={(v) => update('gridRows', v)} />
        <Field label="Columns" value={settings.gridCols} onChange={(v) => update('gridCols', v)} />
      </div>

      <div className="glass-card p-6 space-y-3">
        <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">Round Settings</h3>
        <Field label="Round Timer" value={settings.roundTimer} onChange={(v) => update('roundTimer', v)} suffix="sec" />
        <Field label="Start Game Cost" value={settings.startCost} onChange={(v) => update('startCost', v)} suffix="coins" />
        <Field label="Max Rounds per Gun" value={settings.maxRoundsPerGun} onChange={(v) => update('maxRoundsPerGun', v)} suffix="rounds" />
        <Field label="Energy Cooldown" value={settings.energyCooldownHours} onChange={(v) => update('energyCooldownHours', v)} suffix="hours" />
      </div>

      <div className="flex gap-3">
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 hover:bg-teal-500/30 transition-all cursor-pointer disabled:opacity-50">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {saved ? '✓ Saved to DB!' : 'Save to Database'}
        </button>
        <button onClick={() => setSettings(DEFAULTS)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-slate-700/30 text-slate-400 border border-slate-600/30 hover:bg-slate-700/50 transition-all cursor-pointer">
          <RotateCcw size={16} /> Reset
        </button>
      </div>
    </div>
  );
}
