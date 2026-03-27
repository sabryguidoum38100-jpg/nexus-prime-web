import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nexus Prime Elite — Pronostics IA Institutionnels 2026",
  description: "Plateforme de Predictive Betting haut de gamme. Moteur ONNX/Rust, Edge calibré 2-10%, Quarter-Kelly, Bet Slip interactif. Grade institutionnel.",
  keywords: "pronostics IA, betting quantitatif, edge value, kelly criterion, ONNX, Rust, picks premium",
  openGraph: {
    title: "Nexus Prime Elite — Pronostics IA Institutionnels",
    description: "Moteur ONNX/Rust. Edge 2-10%. Quarter-Kelly. Grade institutionnel.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="bg-black text-white">
        {children}
      </body>
    </html>
  );
}
