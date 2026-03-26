import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'A propos - Nexus Prime Elite 2026',
  description: 'Decouvrez la technologie derriere Nexus Prime Elite, la plateforme de pronostics sportifs alimentee par IA.',
};

export default function AboutPage() {
  const features = [
    {
      icon: '🧠',
      title: 'Modeles XGBoost / ONNX',
      desc: 'Nos modeles de machine learning sont entraines sur des millions de matchs historiques et exportes au format ONNX pour une inference ultra-rapide en production.',
    },
    {
      icon: '📊',
      title: 'Kelly Criterion Dynamique',
      desc: 'Chaque recommandation de mise est calculee en temps reel selon le critere de Kelly, adapte a votre bankroll personnelle pour une gestion optimale du risque.',
    },
    {
      icon: '⚡',
      title: 'Signaux Live WebSocket',
      desc: 'Un flux WebSocket persistant diffuse les signaux de trading sportif en temps reel, avec reconnexion automatique et detection des mouvements de cotes (Steam).',
    },
    {
      icon: '🔒',
      title: 'Authentification JWT Securisee',
      desc: 'Systeme d\'authentification base sur des tokens JWT stockes dans des cookies httpOnly, resistant aux attaques XSS et CSRF.',
    },
    {
      icon: '🦀',
      title: 'Backend Rust / Axum',
      desc: 'Le backend est developpe en Rust avec le framework Axum, offrant des performances exceptionnelles et une securite memoire garantie par le compilateur.',
    },
    {
      icon: '🌐',
      title: 'PWA Installable',
      desc: "L'application est une Progressive Web App installable sur mobile et desktop, avec support hors-ligne et notifications push.",
    },
  ];

  const stack = [
    { label: 'Backend', value: 'Rust 1.83 + Axum 0.7' },
    { label: 'Frontend', value: 'Next.js 15 + React 19' },
    { label: 'IA / ML', value: 'ONNX Runtime + XGBoost' },
    { label: 'Deploiement', value: 'Render + Vercel' },
    { label: 'Auth', value: 'JWT httpOnly Cookies' },
    { label: 'Temps reel', value: 'WebSocket natif' },
    { label: 'Donnees', value: 'The Odds API' },
    { label: 'Mobile', value: 'PWA installable' },
  ];

  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      <div className="container mx-auto px-4 pt-32 pb-20 max-w-4xl">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4">
            A propos
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            La technologie derriere Nexus Prime
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Nexus Prime Elite est une plateforme de pronostics sportifs de nouvelle generation,
            combinant des modeles d'intelligence artificielle avances avec des donnees de marche en temps reel
            pour identifier les opportunites a valeur positive.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {features.map((item, i) => (
            <div key={i} className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-emerald-500/30 transition-colors">
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-gray-900 rounded-xl p-8 border border-emerald-500/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Stack Technique</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stack.map((item, i) => (
              <div key={i} className="bg-gray-800 rounded-lg p-3">
                <p className="text-gray-500 text-xs mb-1">{item.label}</p>
                <p className="text-white text-sm font-semibold">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-bold hover:shadow-lg hover:shadow-emerald-500/30 transition-all">
            Voir les picks IA
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}
