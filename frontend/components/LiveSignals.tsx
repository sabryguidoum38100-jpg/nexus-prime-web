'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Signal {
  id: string;
  match_id: string;
  sport: string;
  pick: string;
  confidence: number;
  edge_percent: number;
  created_at: string;
}

const MOCK_SIGNALS: Signal[] = [
  {
    id: '1',
    match_id: 'PSG vs OM',
    sport: 'Football',
    pick: 'HOME',
    confidence: 0.78,
    edge_percent: 4.2,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    match_id: 'BAYERN vs DORTMUND',
    sport: 'Football',
    pick: 'OVER',
    confidence: 0.72,
    edge_percent: 3.8,
    created_at: new Date(Date.now() - 60000).toISOString(),
  },
];

export default function LiveSignals() {
  const [signals, setSignals] = useState<Signal[]>(MOCK_SIGNALS);
  const [connected, setConnected] = useState(true);

  useEffect(() => {
    // Simulation WebSocket
    const interval = setInterval(() => {
      const newSignal: Signal = {
        id: Math.random().toString(),
        match_id: `Match ${Math.floor(Math.random() * 100)}`,
        sport: 'Football',
        pick: ['HOME', 'AWAY', 'DRAW', 'OVER', 'UNDER'][Math.floor(Math.random() * 5)],
        confidence: 0.6 + Math.random() * 0.3,
        edge_percent: 2 + Math.random() * 4,
        created_at: new Date().toISOString(),
      };
      setSignals(prev => [newSignal, ...prev].slice(0, 10));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
        <div className={`w-3 h-3 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
        <span className="text-cyan-400 font-semibold">
          {connected ? '🟢 Connecté aux signaux temps réel' : '🔴 Déconnecté'}
        </span>
      </div>

      <div className="space-y-3">
        {signals.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            En attente de signaux...
          </div>
        ) : (
          signals.map((signal, idx) => (
            <motion.div
              key={signal.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-4 rounded-lg bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 border border-cyan-500/30 hover:border-cyan-400/60 transition-all"
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <h4 className="font-bold text-white text-lg">{signal.match_id}</h4>
                  <p className="text-xs text-gray-400">{signal.sport}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-400">{signal.pick}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(signal.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-4 mt-3 text-sm">
                <span className="text-cyan-400">
                  Confiance: {(signal.confidence * 100).toFixed(0)}%
                </span>
                <span className="text-emerald-400">
                  Edge: +{signal.edge_percent.toFixed(1)}%
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
