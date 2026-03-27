'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Pick {
  id: string;
  match_id: string;
  sport: string;
  pick: string;
  confidence: number;
  stake: number;
  edge_percent: number;
  kelly: number;
  clv?: number;
  tier: number;
  steam: boolean;
  model_version?: string;
}
interface BetSlipItem { pick: Pick; }

function calcKellyStake(bankroll: number, kelly: number): number {
  return Math.round(bankroll * Math.min(kelly, 0.05) * 100) / 100;
}
function getTierLabel(tier: number) { return tier === 1 ? 'ELITE' : tier === 2 ? 'PRO' : 'INFO'; }
function getTierStyle(tier: number) {
  if (tier === 1) return 'bg-gradient-to-r from-amber-400 to-yellow-300 text-black';
  if (tier === 2) return 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black';
  return 'bg-white/10 text-gray-400';
}

function PickSkeleton() {
  return (
    <div className="animate-pulse bg-[#0d0d0d] rounded-xl p-4 border border-white/5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-2">
          <div className="h-5 w-14 bg-white/10 rounded" />
          <div className="h-5 w-16 bg-white/5 rounded" />
        </div>
        <div className="h-5 w-20 bg-white/10 rounded" />
      </div>
      <div className="h-4 w-2/3 bg-white/10 rounded mb-2" />
      <div className="h-3 w-1/3 bg-white/5 rounded mb-4" />
      <div className="grid grid-cols-4 gap-2">
        {[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-white/5 rounded-lg" />)}
      </div>
    </div>
  );
}

function PickModal({ pick, onClose, bankroll, onAddToBetSlip, inBetSlip }: {
  pick: Pick; onClose: () => void; bankroll: number;
  onAddToBetSlip: (p: Pick) => void; inBetSlip: boolean;
}) {
  const conf = (pick.confidence * 100).toFixed(1);
  const stake = calcKellyStake(bankroll, pick.kelly);
  const potentialProfit = stake * (1 / (pick.confidence || 0.5) - 1);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md px-4"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }} transition={{ type: 'spring', damping: 24, stiffness: 300 }}
        className="relative bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl shadow-amber-500/5"
        onClick={e => e.stopPropagation()}>
        <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-600 hover:text-white text-lg transition">✕</button>
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-3 py-1 rounded-full text-xs font-black ${getTierStyle(pick.tier)}`}>{getTierLabel(pick.tier)}</span>
            {pick.steam && <span className="px-2 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/25">⚡ STEAM</span>}
            <span className="ml-auto text-emerald-400 font-bold text-sm">{pick.edge_percent.toFixed(2)}% Edge</span>
          </div>
          <h2 className="text-xl font-bold text-white">{pick.match_id}</h2>
          <p className="text-gray-400 text-sm mt-1">{pick.sport} — Signal : <span className="text-emerald-400 font-semibold">{pick.pick}</span></p>
        </div>
        <div className="mb-5">
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>Confiance IA</span><span className="text-white font-bold">{conf}%</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${conf}%` }} transition={{ duration: 0.9, ease: 'easeOut' }}
              className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { label: 'Mise recommandée', value: `€${stake.toFixed(2)}`, accent: 'text-amber-400' },
            { label: 'Quarter-Kelly', value: `${(pick.kelly * 100).toFixed(1)}%`, accent: 'text-white' },
            { label: 'Edge détecté', value: `${pick.edge_percent.toFixed(2)}%`, accent: 'text-emerald-400' },
            { label: 'Profit potentiel', value: `+€${potentialProfit.toFixed(2)}`, accent: 'text-teal-400' },
          ].map((item, i) => (
            <div key={i} className="bg-white/5 rounded-xl p-3 border border-white/5">
              <p className="text-gray-500 text-xs mb-1">{item.label}</p>
              <p className={`font-bold text-base ${item.accent}`}>{item.value}</p>
            </div>
          ))}
        </div>
        {pick.clv !== undefined && pick.clv !== 0 && (
          <div className="mb-5 bg-white/5 rounded-xl p-3 border border-white/5">
            <p className="text-gray-500 text-xs mb-1">CLV — Closing Line Value</p>
            <p className={`font-bold ${pick.clv > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {pick.clv > 0 ? '+' : ''}{pick.clv.toFixed(2)}%
            </p>
          </div>
        )}
        <p className="text-gray-600 text-xs mb-5 text-center">Modèle {pick.model_version} · Pariez de manière responsable.</p>
        <button onClick={() => { onAddToBetSlip(pick); onClose(); }} disabled={inBetSlip}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${inBetSlip ? 'bg-white/10 text-gray-400 cursor-default' : 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black hover:shadow-lg hover:shadow-amber-500/30 hover:scale-[1.02]'}`}>
          {inBetSlip ? '✓ Dans le Bet Slip' : '+ Ajouter au Bet Slip'}
        </button>
      </motion.div>
    </motion.div>
  );
}

function BetSlip({ items, bankroll, onRemove, onClear }: {
  items: BetSlipItem[]; bankroll: number; onRemove: (id: string) => void; onClear: () => void;
}) {
  const totalStake = items.reduce((s, i) => s + calcKellyStake(bankroll, i.pick.kelly), 0);
  const totalProfit = items.reduce((s, i) => {
    const st = calcKellyStake(bankroll, i.pick.kelly);
    return s + st * (1 / (i.pick.confidence || 0.5) - 1);
  }, 0);
  if (items.length === 0) return (
    <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 text-center">
      <div className="text-3xl mb-3">🎯</div>
      <p className="text-gray-500 text-sm">Cliquez sur un pick pour l&apos;ajouter</p>
      <p className="text-gray-600 text-xs mt-1">Votre Bet Slip est vide</p>
    </div>
  );
  return (
    <div className="bg-[#0a0a0a] border border-amber-500/20 rounded-2xl overflow-hidden shadow-xl shadow-amber-500/5">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-gradient-to-r from-amber-500/10 to-transparent">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 font-bold text-sm">BET SLIP</span>
          <span className="bg-amber-500 text-black text-xs font-black px-2 py-0.5 rounded-full">{items.length}</span>
        </div>
        <button onClick={onClear} className="text-gray-600 hover:text-red-400 text-xs transition">Vider</button>
      </div>
      <div className="divide-y divide-white/5">
        <AnimatePresence>
          {items.map(({ pick }) => {
            const stake = calcKellyStake(bankroll, pick.kelly);
            return (
              <motion.div key={pick.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="px-4 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-white text-xs font-semibold truncate">{pick.match_id}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-emerald-400 text-xs font-bold">{pick.pick}</span>
                    <span className="text-gray-600 text-xs">{pick.edge_percent.toFixed(1)}% Edge</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-amber-400 font-bold text-sm">€{stake.toFixed(0)}</p>
                  <p className="text-gray-600 text-xs">{(pick.kelly * 100).toFixed(1)}% Kelly</p>
                </div>
                <button onClick={() => onRemove(pick.id)} className="text-gray-700 hover:text-red-400 transition text-lg ml-1">×</button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      <div className="px-4 py-4 border-t border-white/5 space-y-2">
        <div className="flex justify-between text-xs text-gray-400">
          <span>Mise totale</span><span className="text-white font-bold">€{totalStake.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>Profit potentiel</span><span className="text-emerald-400 font-bold">+€{totalProfit.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>% Bankroll engagée</span>
          <span className={`font-bold ${totalStake / bankroll > 0.15 ? 'text-red-400' : 'text-white'}`}>
            {((totalStake / bankroll) * 100).toFixed(1)}%
          </span>
        </div>
        <button className="w-full mt-3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-bold text-sm hover:shadow-lg hover:shadow-emerald-500/30 transition-all hover:scale-[1.02]">
          Valider la sélection
        </button>
      </div>
    </div>
  );
}

function PremiumCard() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="relative bg-[#0d0d0d] rounded-xl p-5 border border-amber-500/30 overflow-hidden min-h-[120px]">
      <div className="absolute inset-0 backdrop-blur-sm bg-black/60 z-10 flex flex-col items-center justify-center gap-3 rounded-xl">
        <div className="text-center">
          <div className="text-2xl mb-1">🔒</div>
          <p className="text-white font-bold text-sm">Pick Premium</p>
          <p className="text-gray-400 text-xs mt-0.5">Réservé aux abonnés Pass Nexus</p>
        </div>
        <a href="/pricing" className="px-5 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-bold text-xs hover:shadow-lg hover:shadow-amber-500/30 transition-all hover:scale-105">
          Débloquer — 19,99€/mois
        </a>
      </div>
      <div className="blur-sm select-none pointer-events-none">
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-2">
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-gradient-to-r from-amber-400 to-yellow-300 text-black">ELITE</span>
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/10 text-amber-400">⚡ STEAM</span>
          </div>
          <span className="text-emerald-400 font-bold text-sm">8.4% Edge</span>
        </div>
        <p className="text-white font-semibold mb-1">████████ vs ████████</p>
        <p className="text-gray-400 text-sm">HOME</p>
      </div>
    </motion.div>
  );
}

export default function PicksSection({ bankroll: initialBankroll = 1000, isPremium = false }: {
  bankroll?: number; isPremium?: boolean;
}) {
  const [picks, setPicks] = useState<Pick[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSport, setFilterSport] = useState('all');
  const [filterConf, setFilterConf] = useState('all');
  const [selectedPick, setSelectedPick] = useState<Pick | null>(null);
  const [betSlip, setBetSlip] = useState<BetSlipItem[]>([]);
  const [bankroll, setBankroll] = useState(initialBankroll);
  const [showBetSlip, setShowBetSlip] = useState(false);

  const fetchPicks = useCallback(async () => {
    setLoading(true);
    try {
      const url = (process.env.NEXT_PUBLIC_BACKEND_URL || 'https://nexus-prime-web.onrender.com') + '/api/picks';
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) setPicks(data);
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPicks(); }, [fetchPicks]);
  useEffect(() => { setBankroll(initialBankroll); }, [initialBankroll]);

  const sports = ['all', ...Array.from(new Set(picks.map(p => p.sport)))];
  const filtered = picks.filter(p => {
    const sportOk = filterSport === 'all' || p.sport === filterSport;
    const confOk = filterConf === 'all' ? true
      : filterConf === 'high' ? p.confidence >= 0.70
      : filterConf === 'medium' ? p.confidence >= 0.50 && p.confidence < 0.70
      : p.confidence < 0.50;
    return sportOk && confOk;
  });

  const FREE_LIMIT = 3;
  const freePicks = filtered.slice(0, FREE_LIMIT);
  const premiumPicks = filtered.slice(FREE_LIMIT);

  const addToBetSlip = (pick: Pick) => {
    if (betSlip.find(i => i.pick.id === pick.id)) return;
    setBetSlip(prev => [...prev, { pick }]);
    setShowBetSlip(true);
  };
  const isInBetSlip = (id: string) => betSlip.some(i => i.pick.id === id);

  const PickCard = ({ pick, idx, premium = false }: { pick: Pick; idx: number; premium?: boolean }) => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
      onClick={() => setSelectedPick(pick)}
      className={`bg-[#0d0d0d] rounded-xl p-4 border cursor-pointer transition-all group ${
        isInBetSlip(pick.id) ? 'border-amber-500/50 shadow-lg shadow-amber-500/5'
        : premium ? 'border-amber-500/10 hover:border-amber-500/30 hover:bg-[#111]'
        : 'border-white/5 hover:border-emerald-500/30 hover:bg-[#111]'
      }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-xs font-black ${getTierStyle(pick.tier)}`}>{getTierLabel(pick.tier)}</span>
          {pick.steam && <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">⚡ STEAM</span>}
          {isInBetSlip(pick.id) && <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">✓ Slip</span>}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-emerald-400 font-bold text-sm">{pick.edge_percent.toFixed(2)}% Edge</span>
          <span className="text-gray-700 text-xs group-hover:text-gray-400 transition-colors">Détails →</span>
        </div>
      </div>
      <p className="text-white font-semibold mb-1">{pick.match_id}</p>
      <p className="text-gray-500 text-sm mb-3">{pick.pick}</p>
      <div className="grid grid-cols-4 gap-2 text-xs">
        {[
          { label: 'Confiance', value: `${(pick.confidence * 100).toFixed(0)}%`, color: 'text-white' },
          { label: 'Mise', value: `€${calcKellyStake(bankroll, pick.kelly).toFixed(0)}`, color: 'text-amber-400' },
          { label: 'Kelly', value: `${(pick.kelly * 100).toFixed(1)}%`, color: 'text-white' },
          { label: 'Sport', value: pick.sport, color: 'text-white' },
        ].map((c, i) => (
          <div key={i} className="bg-white/5 rounded-lg p-2">
            <p className="text-gray-600 text-xs">{c.label}</p>
            <p className={`font-bold truncate ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );

  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-3">
              <h2 className="text-white font-bold text-lg">AI Picks <span className="text-gray-600 font-normal text-sm">({filtered.length})</span></h2>
              {betSlip.length > 0 && (
                <button onClick={() => setShowBetSlip(!showBetSlip)}
                  className="xl:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold">
                  🎯 Bet Slip ({betSlip.length})
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
                <span className="text-gray-400 text-xs">Bankroll</span>
                <span className="text-amber-400 font-bold text-xs">€</span>
                <input type="number" value={bankroll} onChange={e => setBankroll(Math.max(1, Number(e.target.value)))}
                  className="bg-transparent text-white font-bold text-sm w-20 outline-none" min={1} />
              </div>
              <button onClick={fetchPicks} disabled={loading}
                className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 disabled:opacity-50 text-xs font-semibold transition-all">
                {loading ? '⏳' : '↻ Actualiser'}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            {sports.slice(0, 6).map(s => (
              <button key={s} onClick={() => setFilterSport(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterSport === s ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white border border-transparent'}`}>
                {s === 'all' ? 'Tous' : s}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mb-6">
            {[{ key: 'all', label: 'Toutes confiances' }, { key: 'high', label: '🔥 Haute (70%+)' }, { key: 'medium', label: '📊 Moyenne (50-70%)' }, { key: 'low', label: '📉 Faible (<50%)' }].map(f => (
              <button key={f.key} onClick={() => setFilterConf(f.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterConf === f.key ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white border border-transparent'}`}>
                {f.label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {loading ? [...Array(5)].map((_, i) => <PickSkeleton key={i} />) : filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-600"><p className="text-4xl mb-3">🔍</p><p>Aucun pick pour ces filtres.</p></div>
            ) : (
              <>
                {freePicks.map((pick, idx) => <PickCard key={pick.id} pick={pick} idx={idx} />)}
                {premiumPicks.length > 0 && (
                  <>
                    <div className="flex items-center gap-3 my-4">
                      <div className="flex-1 h-px bg-amber-500/20" />
                      <span className="text-amber-400/70 text-xs font-bold tracking-widest uppercase">Premium</span>
                      <div className="flex-1 h-px bg-amber-500/20" />
                    </div>
                    {isPremium ? (
                      premiumPicks.map((pick, idx) => <PickCard key={pick.id} pick={pick} idx={idx} premium />)
                    ) : (
                      <>
                        {[...Array(Math.min(3, premiumPicks.length))].map((_, i) => <PremiumCard key={i} />)}
                        {premiumPicks.length > 3 && (
                          <div className="text-center py-4">
                            <p className="text-gray-600 text-sm">+ {premiumPicks.length - 3} picks premium supplémentaires</p>
                            <a href="/pricing" className="inline-block mt-3 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-bold text-sm hover:shadow-lg hover:shadow-amber-500/30 transition-all">
                              Débloquer tout — 19,99€/mois
                            </a>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Colonne Bet Slip desktop */}
        <div className="hidden xl:block">
          <div className="sticky top-24 space-y-4">
            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-4">
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">Ma Bankroll</p>
              <div className="flex items-center gap-2">
                <span className="text-amber-400 text-xl font-bold">€</span>
                <input type="number" value={bankroll} onChange={e => setBankroll(Math.max(1, Number(e.target.value)))}
                  className="bg-transparent text-white font-bold text-2xl w-full outline-none" min={1} />
              </div>
              <div className="mt-3 flex gap-2">
                {[500, 1000, 2000, 5000].map(v => (
                  <button key={v} onClick={() => setBankroll(v)}
                    className={`flex-1 py-1 rounded text-xs font-semibold transition-all ${bankroll === v ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}>
                    {v >= 1000 ? `${v / 1000}k` : v}
                  </button>
                ))}
              </div>
            </div>
            <BetSlip items={betSlip} bankroll={bankroll} onRemove={id => setBetSlip(prev => prev.filter(i => i.pick.id !== id))} onClear={() => setBetSlip([])} />
            {!isPremium && (
              <div className="bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border border-amber-500/20 rounded-2xl p-4 text-center">
                <div className="text-2xl mb-2">👑</div>
                <p className="text-white font-bold text-sm mb-1">Pass Nexus Premium</p>
                <p className="text-gray-400 text-xs mb-3">Accès illimité à tous les picks ELITE</p>
                <a href="/pricing" className="block w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-bold text-sm hover:shadow-lg hover:shadow-amber-500/30 transition-all">
                  19,99€ / mois
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedPick && (
          <PickModal pick={selectedPick} onClose={() => setSelectedPick(null)} bankroll={bankroll}
            onAddToBetSlip={addToBetSlip} inBetSlip={isInBetSlip(selectedPick.id)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBetSlip && betSlip.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }}
            className="xl:hidden fixed bottom-4 left-4 right-4 z-40 shadow-2xl shadow-black/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-amber-400 font-bold text-sm">Bet Slip ({betSlip.length})</span>
              <button onClick={() => setShowBetSlip(false)} className="text-gray-500 hover:text-white text-sm">✕</button>
            </div>
            <BetSlip items={betSlip} bankroll={bankroll} onRemove={id => setBetSlip(prev => prev.filter(i => i.pick.id !== id))} onClear={() => setBetSlip([])} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
