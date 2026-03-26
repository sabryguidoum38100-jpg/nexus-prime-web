import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-emerald-500/20 bg-black/50 backdrop-blur-md">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-emerald-400 mb-4">Produit</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link href="/#picks-section" className="hover:text-emerald-400 transition">Picks IA</Link></li>
              <li><Link href="/#live-section" className="hover:text-emerald-400 transition">Signaux Live</Link></li>
              <li><Link href="/about" className="hover:text-emerald-400 transition">Technologie</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-cyan-400 mb-4">Ressources</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link href="/about" className="hover:text-cyan-400 transition">Documentation</Link></li>
              <li><a href="https://nexus-prime-web.onrender.com/health" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition">API Status</a></li>
              <li><Link href="/contact" className="hover:text-cyan-400 transition">Support</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-emerald-400 mb-4">Entreprise</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link href="/about" className="hover:text-emerald-400 transition">A propos</Link></li>
              <li><Link href="/contact" className="hover:text-emerald-400 transition">Contact</Link></li>
              <li><Link href="/terms" className="hover:text-emerald-400 transition">Conditions</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-cyan-400 mb-4">Suivez-nous</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition">Twitter / X</a></li>
              <li><a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition">Discord</a></li>
              <li><a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition">GitHub</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-emerald-500/20 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            &copy; 2026 Nexus Prime Elite. Tous droits reserves.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <Link href="/terms" className="hover:text-gray-400 transition">CGU</Link>
            <span>|</span>
            <Link href="/contact" className="hover:text-gray-400 transition">Contact</Link>
            <span>|</span>
            <span>Rust + Next.js + ONNX AI</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
