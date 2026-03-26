# Nexus Prime Elite 2026 - Plateforme de Pronostics Sportifs IA (SaaS)

**Prix demandé :** $3,500
**Revenu mensuel (MRR) :** $0 (Projet pré-lancement, prêt pour la production)
**Trafic mensuel :** 0
**Catégorie :** SaaS / IA / Sports Betting
**Stack Technique :** Rust (Axum), Next.js 15, React 19, TailwindCSS, WebSocket, JWT, ONNX Runtime (XGBoost)

---

## 🚀 À propos du projet

**Nexus Prime Elite 2026** est une plateforme SaaS de pronostics sportifs de nouvelle génération. Contrairement aux sites de pronostics classiques qui se basent sur l'intuition humaine, Nexus Prime utilise des modèles de Machine Learning (XGBoost exportés en ONNX) pour analyser les données historiques et identifier les opportunités à valeur positive (Value Bets).

Le projet a été conçu avec une architecture de niveau entreprise, capable de supporter des milliers d'utilisateurs simultanés grâce à son backend en Rust et son frontend ultra-rapide en Next.js.

### 🌟 Fonctionnalités Principales

1. **Picks IA Quotidiens :** Recommandations de paris générées par des modèles XGBoost avec calcul de probabilité de victoire et d'Edge (valeur).
2. **Gestion de Bankroll Dynamique (Kelly Criterion) :** Le système calcule automatiquement la mise recommandée (Stake) en fonction de la bankroll de l'utilisateur et de l'Edge détecté, maximisant la croissance du capital tout en minimisant le risque de ruine.
3. **Signaux Live (WebSocket) :** Flux de données en temps réel diffusant les mouvements de cotes (Steam) et les alertes de marché directement dans le navigateur de l'utilisateur sans rechargement.
4. **Authentification Sécurisée :** Système JWT stateless complet avec cookies `httpOnly`, résistant aux attaques XSS et CSRF.
5. **PWA (Progressive Web App) :** L'application est installable sur mobile (iOS/Android) et desktop, offrant une expérience native.

---

## 💻 Stack Technique & Architecture

L'architecture a été pensée pour la performance, la sécurité et la scalabilité :

*   **Backend (API & WebSocket) :** Développé en **Rust** avec le framework **Axum**. Offre des performances exceptionnelles (temps de réponse < 10ms) et une sécurité mémoire garantie. Déployé sur Render.
*   **Frontend :** **Next.js 15** (App Router) avec **React 19**. Rendu hybride (SSR/SSG) pour un SEO optimal. Déployé sur Vercel.
*   **Styling & UI :** **TailwindCSS** avec **Framer Motion** pour des animations fluides et un design cyberpunk/néon (Emerald/Cyan). Notifications via **Sonner**.
*   **Machine Learning :** Modèles entraînés en Python (XGBoost) et exportés au format **ONNX** pour une inférence ultra-rapide directement dans le backend Rust via `tract-onnx`.
*   **Authentification :** JWT (JSON Web Tokens) stateless utilisant la Web Crypto API (Edge Runtime compatible), stockés dans des cookies sécurisés.

---

## 📈 Potentiel de Monétisation

Le projet est livré prêt à être monétisé via un modèle d'abonnement (SaaS) :

*   **Plan Gratuit :** Accès à 1 pick IA par jour, bankroll virtuelle limitée.
*   **Plan Pro ($29/mois) :** Accès complet aux picks IA, gestion de bankroll dynamique.
*   **Plan Elite ($79/mois) :** Accès aux signaux Live WebSocket (Steam, blessures de dernière minute) et API privée.

Le marché des paris sportifs est en pleine explosion mondiale, et les parieurs sont constamment à la recherche d'outils analytiques pour obtenir un avantage sur les bookmakers.

---

## 📦 Ce qui est inclus dans la vente

1.  **Code source complet :** Dépôt GitHub contenant le backend Rust et le frontend Next.js.
2.  **Modèles IA :** Les fichiers `.onnx` pré-entraînés et les scripts Python d'entraînement.
3.  **Déploiements configurés :** Transfert des projets Vercel (Frontend) et Render (Backend).
4.  **Documentation :** Guide de déploiement, documentation de l'API et guide d'entraînement des modèles.
5.  **Support post-vente :** 14 jours de support technique pour vous aider à prendre en main le code et l'infrastructure.

---

## 🛠️ Dernières mises à jour (Production-Ready)

Le projet vient de recevoir une mise à jour majeure pour garantir sa stabilité en production :
*   Remplacement du mock d'authentification par un véritable système JWT stateless sécurisé.
*   Correction et stabilisation du flux WebSocket avec reconnexion automatique.
*   Intégration du calcul dynamique de Kelly basé sur la bankroll réelle de l'utilisateur connecté.
*   Ajout des pages légales et de contact complètes.

**Lien de démo :** [https://nexus-prime-web.vercel.app](https://nexus-prime-web.vercel.app)
*(Créez un compte de test pour voir le calcul dynamique de la bankroll et les signaux live)*
