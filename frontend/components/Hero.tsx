'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Hero() {
  const scrollToPicks = () => {
    if (typeof document !== 'undefined') {
      document.getElementById('picks-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px]" />
      </div>
      <div className="container mx-auto px-4 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black tracking-[0.2em] text-amber-500 uppercase mb-6">
            <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
            Moteur ONNX v6.2 — Live Data
          </span>
          <h1 className="text-5xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter mb-8">
            L&apos;IA QUI DÉTECTE <br />
            <span className="bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 bg-clip-text text-transparent">
              L&apos;EDGE DU MARCHÉ
            </span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
            Nexus Prime utilise des modèles de <span className="text-white font-bold">Deep Learning</span> pour identifier les inefficacités des bookmakers en temps réel. Précision institutionnelle pour parieurs exigeants.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <button 
              onClick={scrollToPicks}
              className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-lg hover:shadow-[0_0_40px_rgba(245,158,11,0.3)] transition-all transform hover:scale-105"
            >
              Accéder aux Picks
            </button>
            <Link href="/login" className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-lg hover:bg-white/10 transition-all">
              Pass Nexus Premium
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto pt-12 border-t border-white/5">
            <div>
              <p className="text-white font-black text-2xl">94.2%</p>
              <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">CLV Beat Rate</p>
            </div>
            <div>
              <p className="text-emerald-400 font-black text-2xl">+12.4%</p>
              <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">ROI Mensuel</p>
            </div>
            <div>
              <p className="text-white font-black text-2xl">24/7</p>
              <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">Monitoring Live</p>
            </div>
            <div>
              <p className="text-amber-500 font-black text-2xl">Elite</p>
              <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">Standard Algo</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
