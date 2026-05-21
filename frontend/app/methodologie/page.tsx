'use client';
import Header from '@/components/Header';
import { motion } from 'framer-motion';

export default function MethodologiePage() {
  const steps = [
    {
      title: "Ingestion Massive de Data",
      desc: "Nous traitons plus de 200 variables par match : forme dynamique, xG historique, absences clés, et flux de cotes en temps réel via The Odds API.",
      icon: "📊"
    },
    {
      title: "Moteur d'Inférence ONNX v6",
      desc: "Nos modèles XGBoost sont optimisés et exportés au format ONNX pour une exécution ultra-rapide en Rust, garantissant une latence minimale.",
      icon: "⚡"
    },
    {
      title: "Calibration Platt",
      desc: "Contrairement aux modèles bruts, nous appliquons une calibration de Platt pour transformer les scores en probabilités réelles et fiables.",
      icon: "🎯"
    },
    {
      title: "Détection d'Edge & Kelly",
      desc: "L'IA compare ses probabilités aux cotes de Pinnacle. Si un écart (Edge) est détecté, le critère de Kelly calcule la mise optimale.",
      icon: "💰"
    }
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-black pt-28 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
          >
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6">La Science de l&apos;Edge</h1>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Nexus Prime n&apos;est pas un service de pronostics classique. C&apos;est un outil de trading quantitatif appliqué au football.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            {steps.map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-[#0a0a0a] border border-white/8 p-8 rounded-3xl hover:border-amber-500/20 transition-colors"
              >
                <div className="text-4xl mb-4">{step.icon}</div>
                <h3 className="text-white font-black text-xl mb-3">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border border-amber-500/20 rounded-3xl p-10 text-center">
            <h2 className="text-white font-black text-2xl mb-4">Prêt à exploiter la data ?</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">Rejoignez les parieurs qui utilisent l&apos;IA pour battre le marché sur le long terme.</p>
            <a href="/signup" className="inline-block px-10 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black hover:shadow-2xl hover:shadow-amber-500/30 transition-all">
              Démarrer l&apos;Analyse
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
