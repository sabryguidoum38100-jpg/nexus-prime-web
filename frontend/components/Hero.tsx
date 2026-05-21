'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Hero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToPicks = () => {
    if (typeof document !== 'undefined') {
      document.getElementById('picks-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!mounted) return <div className="min-h-screen bg-black" />;

  return (
    <section className="relative pt-32 pb-12 md:pt-40 md:pb-20 overflow-hidden bg-[#020202]">
      {/* Fond Dynamique / Grille Tech */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-amber-500/10 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] animate-pulse" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Texte & CTA */}
          <div className="flex-1 text-left">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-8">
                <div className="flex gap-1">
                  <div className="w-1 h-3 bg-amber-500 animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-1 h-3 bg-amber-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-1 h-3 bg-amber-500 animate-bounce" style={{ animationDelay: '0.3s' }} />
                </div>
                <span className="text-[10px] font-black tracking-[0.3em] text-amber-500 uppercase">
                  Moteur ONNX v6.2 — Live Quant Terminal
                </span>
              </div>

              <h1 className="text-6xl md:text-[7.5rem] font-black text-white leading-[0.85] tracking-tighter mb-8">
                BEAT THE <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-600 italic">
                  MARKET EDGE.
                </span>
              </h1>

              <p className="text-gray-400 text-lg md:text-xl max-w-xl mb-12 leading-relaxed font-medium">
                Nexus Prime n&apos;est pas une simple landing page. C&apos;est votre <span className="text-white font-bold">Terminal d&apos;Inférence IA</span> pour le betting institutionnel. Infiltration de flux live, calcul d&apos;edge en microsecondes.
              </p>

              <div className="flex flex-wrap items-center gap-6">
                <button 
                  onClick={scrollToPicks}
                  className="px-10 py-5 rounded-2xl bg-amber-500 text-black font-black text-lg hover:shadow-[0_0_50px_rgba(245,158,11,0.4)] transition-all transform hover:scale-105 flex items-center gap-3"
                >
                  <span className="text-2xl">🎯</span> ACCÉDER AU TERMINAL
                </button>
                <div className="flex flex-col">
                  <span className="text-white font-black text-xl tracking-tight">€2.4M+</span>
                  <span className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">Volume Analysé / 24h</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Visualisation "Produit Actif" / Dashboard Preview */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotateY: 10 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="flex-1 w-full max-w-2xl hidden lg:block"
          >
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-emerald-500/20 rounded-[2.5rem] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000" />
              <div className="relative bg-[#0a0a0a] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/2">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500/50" />
                    <div className="w-2 h-2 rounded-full bg-amber-500/50" />
                    <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
                  </div>
                  <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                    Live Feed: encrypted_stream_v6
                  </div>
                </div>
                <div className="p-8 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/3 border border-white/5 p-4 rounded-2xl">
                      <p className="text-gray-600 text-[9px] font-bold uppercase mb-1">Win Rate (ELITE)</p>
                      <p className="text-white font-black text-2xl">72.4%</p>
                    </div>
                    <div className="bg-white/3 border border-white/5 p-4 rounded-2xl">
                      <p className="text-gray-600 text-[9px] font-bold uppercase mb-1">Avg. Edge</p>
                      <p className="text-emerald-400 font-black text-2xl">+8.1%</p>
                    </div>
                  </div>
                  <div className="space-y-3 opacity-80">
                    <div className="bg-white/2 border border-white/5 p-3 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs">⚽</div>
                        <div>
                          <p className="text-white font-bold text-[10px]">MATCH_7721 — LIVE</p>
                          <p className="text-gray-600 text-[9px]">Analyzing Pinnacle Movement...</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="w-12 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 animate-pulse" style={{ width: '60%' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 flex justify-center">
                    <div className="px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-widest animate-pulse">
                      Inférence ONNX en cours...
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Trust Bar Massif */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-y border-white/5">
          <div className="text-center md:text-left">
            <p className="text-white font-black text-3xl md:text-4xl mb-1 tracking-tighter">94.2%</p>
            <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.2em]">CLV Beat Rate</p>
          </div>
          <div className="text-center md:text-left">
            <p className="text-emerald-400 font-black text-3xl md:text-4xl mb-1 tracking-tighter">+12.4%</p>
            <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.2em]">ROI Mensuel Moyen</p>
          </div>
          <div className="text-center md:text-left">
            <p className="text-white font-black text-3xl md:text-4xl mb-1 tracking-tighter">12.8k</p>
            <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.2em]">Points de Data / Sec</p>
          </div>
          <div className="text-center md:text-left">
            <p className="text-amber-500 font-black text-3xl md:text-4xl mb-1 tracking-tighter">ELITE</p>
            <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.2em]">Algo Grade Institutionnel</p>
          </div>
        </div>
      </div>
    </section>
  );
}
