'use client';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PickCard from './PickCard';
import PickModal from './PickModal';
import BetSlipPanel from './BetSlipPanel';
import { toast } from 'sonner';

interface Pick {
  id: string;
  sport: string;
  league: string;
  home: string;
  away: string;
  pick: string;
  odds: number;
  confidence: number;
  edge_percent: number;
  kelly: number;
  tier: string;
  match_time: string;
  clv: number;
  model_version: string;
  steam: boolean;
  ai_analysis: string;
  home_form: string;
  away_form: string;
  h2h: string;
}

export default function PicksSection({ bankroll }: { bankroll: number }) {
  const [picks, setPicks] = useState<Pick[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTier, setFilterTier] = useState<'all' | 'ELITE' | 'PRO' | 'INFO'>('all');
  const [filterConf, setFilterConf] = useState('all');
  const [selectedPick, setSelectedPick] = useState<Pick | null>(null);
  const [betSlip, setBetSlip] = useState<Pick[]>([]);
  const [showBetSlip, setShowBetSlip] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    fetchPicks();
    // Check premium status
    fetch('/api/auth')
      .then(r => r.json())
      .then(data => setIsPremium(data.user?.isPremium || false))
      .catch(() => {});
  }, []);

  const fetchPicks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/picks');
      const data = await res.json();
      if (data.picks) {
        setPicks(data.picks);
      }
    } catch (err) {
      toast.error("Erreur lors de la récupération des picks");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return picks.filter(p => {
      const tierMatch = filterTier === 'all' || p.tier === filterTier;
      const conf = p.confidence * 100;
      let confMatch = true;
      if (filterConf === 'high') confMatch = conf >= 70;
      else if (filterConf === 'medium') confMatch = conf >= 50 && conf < 70;
      else if (filterConf === 'low') confMatch = conf < 50;
      return tierMatch && confMatch;
    });
  }, [picks, filterTier, filterConf]);

  const addToSlip = (pick: Pick) => {
    if (betSlip.find(p => p.id === pick.id)) {
      toast.error("Déjà dans le slip");
      return;
    }
    setBetSlip([...betSlip, pick]);
    toast.success("Ajouté au slip");
  };

  const removeFromSlip = (id: string) => {
    setBetSlip(betSlip.filter(p => p.id !== id));
  };

  if (!isMounted) return null;

  const freePicks = filtered.filter(p => p.tier !== 'ELITE' || isPremium);
  const premiumPicks = filtered.filter(p => p.tier === 'ELITE' && !isPremium);

  return (
    <div className="space-y-8">
      {/* Filtres */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white/3 p-4 rounded-2xl border border-white/8">
        <div className="flex flex-wrap gap-2">
          {(['all', 'ELITE', 'PRO', 'INFO'] as const).map(t => (
            <button key={t} onClick={() => setFilterTier(t)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                filterTier === t
                  ? 'bg-amber-500 text-black border-amber-500'
                  : 'bg-transparent text-gray-500 border-white/10 hover:border-white/20'
              }`}>
              {t === 'all' ? 'Tous les rangs' : t}
            </button>
          ))}
        </div>
        <button onClick={fetchPicks} className="text-gray-500 hover:text-white text-sm flex items-center gap-2">
          <span className={loading ? 'animate-spin' : ''}>↻</span> Sync Live
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 bg-white/5 animate-pulse rounded-2xl border border-white/8" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-white/10 rounded-3xl">
          <p className="text-gray-500">Aucun signal détecté pour ces critères.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {freePicks.map(p => (
            <PickCard 
              key={p.id} 
              pick={p} 
              bankroll={bankroll} 
              onOpen={() => setSelectedPick(p)}
              onAdd={() => addToSlip(p)}
            />
          ))}
          {premiumPicks.map(p => (
            <div key={p.id} className="relative group">
              <div className="blur-sm grayscale opacity-40 pointer-events-none">
                <PickCard pick={p} bankroll={bankroll} onOpen={() => {}} onAdd={() => {}} />
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-black/40 rounded-2xl border border-amber-500/20">
                <span className="text-2xl mb-2">👑</span>
                <h4 className="text-amber-400 font-black text-sm uppercase tracking-tighter">Signal ELITE</h4>
                <p className="text-gray-400 text-xs mt-1 mb-4">Réservé aux membres Premium</p>
                <button className="px-4 py-2 bg-amber-500 text-black text-xs font-black rounded-lg">Débloquer</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals & Panels */}
      <AnimatePresence>
        {selectedPick && (
          <PickModal pick={selectedPick} bankroll={bankroll} onClose={() => setSelectedPick(null)} />
        )}
      </AnimatePresence>

      <button 
        onClick={() => setShowBetSlip(true)}
        className="fixed bottom-8 right-8 z-50 bg-amber-500 text-black px-6 py-4 rounded-2xl font-black shadow-2xl shadow-amber-500/20 flex items-center gap-3 hover:scale-105 transition-transform"
      >
        <span>📋</span> Bet Slip
        {betSlip.length > 0 && (
          <span className="bg-black text-amber-500 px-2 py-0.5 rounded-full text-xs">{betSlip.length}</span>
        )}
      </button>

      <AnimatePresence>
        {showBetSlip && (
          <BetSlipPanel 
            items={betSlip} 
            bankroll={bankroll} 
            onClose={() => setShowBetSlip(false)} 
            onRemove={removeFromSlip}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
