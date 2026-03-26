'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Signal {
  id: string;
  match_id: string;
  sport: string;
  pick: string;
  confidence: number;
  edge_percent: number;
  tier: number;
  steam: boolean;
  created_at: string;
}

const BACKEND_WS = 'wss://nexus-prime-web.onrender.com/ws/live';
const MAX_SIGNALS = 12;
const RECONNECT_DELAY = 3000;

export default function LiveSignals() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const connect = useCallback(() => {
    if (!mountedRef.current) return;
    if (wsRef.current) wsRef.current.close();
    setStatus('connecting');
    try {
      const ws = new WebSocket(BACKEND_WS);
      wsRef.current = ws;
      ws.onopen = () => { if (mountedRef.current) setStatus('connected'); };
      ws.onmessage = (event) => {
        if (!mountedRef.current) return;
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'signal' && data.payload) {
            setSignals(prev => [data.payload, ...prev].slice(0, MAX_SIGNALS));
          } else if (data.type === 'ping') {
            ws.send(JSON.stringify({ type: 'pong' }));
          }
        } catch { /* ignore */ }
      };
      ws.onerror = () => { if (mountedRef.current) setStatus('disconnected'); };
      ws.onclose = () => {
        if (!mountedRef.current) return;
        setStatus('disconnected');
        reconnectTimer.current = setTimeout(() => { if (mountedRef.current) connect(); }, RECONNECT_DELAY);
      };
    } catch {
      setStatus('disconnected');
      reconnectTimer.current = setTimeout(() => { if (mountedRef.current) connect(); }, RECONNECT_DELAY);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    connect();
    return () => {
      mountedRef.current = false;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [connect]);

  const getTierColor = (tier: number) => {
    if (tier === 1) return 'bg-yellow-500';
    if (tier === 2) return 'bg-emerald-500';
    return 'bg-gray-500';
  };

  const getTierLabel = (tier: number) => {
    if (tier === 1) return 'ELITE';
    if (tier === 2) return 'PRO';
    return 'INFO';
  };

  const statusConfig = {
    connected: { color: 'bg-emerald-500', text: 'En direct', pulse: true },
    connecting: { color: 'bg-yellow-500', text: 'Connexion...', pulse: true },
    disconnected: { color: 'bg-red-500', text: 'Deconnecte', pulse: false },
  };
  const cfg = statusConfig[status];

  return (
    <div className="w-full bg-gray-900 rounded-xl p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-white">Signaux Live</h2>
          <p className="text-xs text-gray-500 mt-0.5">Mises a jour temps reel via WebSocket</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className={`w-2.5 h-2.5 rounded-full ${cfg.color}`} />
            {cfg.pulse && <div className={`absolute inset-0 rounded-full ${cfg.color} animate-ping opacity-60`} />}
          </div>
          <span className="text-xs text-gray-400">{cfg.text}</span>
        </div>
      </div>

      <div className="space-y-3 min-h-[120px]">
        {signals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mb-3">
              <span className="text-2xl">📡</span>
            </div>
            <p className="text-gray-400 text-sm font-medium">
              {status === 'connecting' ? 'Connexion au flux live...' : 'En attente de signaux...'}
            </p>
            <p className="text-gray-600 text-xs mt-1">Les signaux apparaissent ici en temps reel</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {signals.map((signal) => (
              <motion.div
                key={signal.id}
                initial={{ opacity: 0, x: 20, scale: 0.97 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.97 }}
                transition={{ type: 'spring', damping: 20 }}
                className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-emerald-500/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold text-white ${getTierColor(signal.tier)}`}>
                        {getTierLabel(signal.tier)}
                      </span>
                      {signal.steam && (
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                          STEAM
                        </span>
                      )}
                      <span className="text-gray-500 text-xs ml-auto">
                        {new Date(signal.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-white font-semibold text-sm truncate">{signal.match_id}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{signal.pick} - {signal.sport}</p>
                  </div>
                  <div className="text-right ml-4 shrink-0">
                    <p className="text-emerald-400 font-bold text-sm">{signal.edge_percent.toFixed(2)}%</p>
                    <p className="text-gray-500 text-xs">Edge</p>
                    <p className="text-white font-semibold text-sm mt-1">{(signal.confidence * 100).toFixed(0)}%</p>
                    <p className="text-gray-500 text-xs">Conf.</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
