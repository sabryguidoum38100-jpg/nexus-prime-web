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
  steam: boolean;
  ai_analysis: string;
}

export default function PicksSection({ bankroll }: { bankroll: number }) {
  const [picks, setPicks] = useState<Pick[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPick, setSelectedPick] = useState<Pick | null>(null);
  const [betSlip, setBetSlip] = useState<Pick[]>([]);
  const [isSlipOpen, setIsSlipOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchPicks = async () => {
      try {
        const res = await fetch('/api/picks');
        const data = await res.json();
        setPicks(data.picks || []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPicks();
  }, []);

  const addToSlip = (pick: Pick) => {
    if (betSlip.find(p => p.id === pick.id)) {
      toast.error("Déjà dans le slip");
      return;
    }
    setBetSlip([...betSlip, pick]);
    setIsSlipOpen(true);
    toast.success("Ajouté au Bet Slip");
  };

  const removeFromSlip = (id: string) => {
    setBetSlip(betSlip.filter(p => p.id !== id));
  };

  if (!mounted) return <div className="min-h-[400px]" />;

  return (
    <section className="relative">
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-[380px] rounded-2xl bg-white/5 animate-pulse border border-white/5" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {picks.map((pick) => (
              <PickCard 
                key={pick.id} 
                pick={pick} 
                bankroll={bankroll}
                onOpen={() => setSelectedPick(pick)}
                onAdd={() => addToSlip(pick)}
              />
            ))}
          </div>

          <PickModal 
            pick={selectedPick} 
            bankroll={bankroll} 
            onClose={() => setSelectedPick(null)} 
          />

          <AnimatePresence>
            {isSlipOpen && (
              <BetSlipPanel 
                items={betSlip}
                bankroll={bankroll}
                onClose={() => setIsSlipOpen(false)}
                onRemove={removeFromSlip}
              />
            )}
          </AnimatePresence>

          {betSlip.length > 0 && !isSlipOpen && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={() => setIsSlipOpen(true)}
              className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-amber-500 text-black shadow-2xl flex items-center justify-center z-[100] hover:scale-110 transition-transform"
            >
              <span className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full text-[10px] font-black flex items-center justify-center border-2 border-amber-500">
                {betSlip.length}
              </span>
              <span className="text-2xl">📋</span>
            </motion.button>
          )}
        </>
      )}
    </section>
  );
}
