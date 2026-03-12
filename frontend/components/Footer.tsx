'use client';

import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer className="border-t border-emerald-500/20 bg-black/50 backdrop-blur-md">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-emerald-400 mb-4">Produit</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-emerald-400 transition">Picks IA</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition">Signaux Live</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition">Analyse</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-cyan-400 mb-4">Ressources</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-cyan-400 transition">Documentation</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition">API</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition">Blog</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-emerald-400 mb-4">Entreprise</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-emerald-400 transition">À Propos</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition">Contact</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition">Conditions</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-cyan-400 mb-4">Suivez-nous</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-cyan-400 transition">Twitter</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition">Discord</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition">GitHub</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-emerald-500/20 pt-8 flex justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2026 Nexus Prime Pronos. Tous droits réservés.
          </p>
          <p className="text-gray-500 text-xs">
            Construit avec Rust + Next.js + IA
          </p>
        </div>
      </div>
    </footer>
  );
}
