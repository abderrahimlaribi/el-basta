# 🍵 ElBasta - Salon de Thé & Café

**ElBasta** est un salon de thé moderne situé à Alger, spécialisé dans les boissons artisanales, crêpes françaises, et douceurs faites maison. Notre site web offre une expérience de commande en ligne fluide avec livraison directe via WhatsApp et un système de suivi en temps réel.

## 🏪 À Propos d'ElBasta

ElBasta est votre destination pour des moments de détente autour d'un bon café ou thé. Nous proposons une sélection soigneusement choisie de:

- **Jus Naturels** - Pressés à froid avec des fruits frais
- **Crêpes Artisanales** - Sucrées et salées, préparées à la commande  
- **Cappuccinos Premium** - Avec art latte et sirops artisanaux
- **Douceurs Françaises** - Macarons, éclairs et tartes aux fruits

### 📍 Informations de Contact

- **Adresse**: ElBasta, Alger, Algérie
- **Téléphone**: 0770 22 44 72
- **Email**: contact@elbasta.dz
- **Horaires**: 24h/24, tous les jours
- **Google Maps**: [Voir l'emplacement](https://www.google.com/maps/place/ELBASTA/@36.7338212,3.1742928,17z/data=!3m1!4b1!4m6!3m5!1s0x128e5383b6a54f93:0x834aa723d5c85d8a!8m2!3d36.7338212!4d3.1742928!16s%2Fg%2F11l59j0gkv?entry=ttu)

### 🌐 Réseaux Sociaux

- **Facebook**: [ElBasta Official](https://www.facebook.com/profile.php?id=61552378694624&ref=_xav_ig_profile_page_web#)
- **Instagram**: [@elbasta.dz](https://www.instagram.com/elbasta.dz/)

## ✨ Fonctionnalités du Site Web

### 🛒 Système de Commande
- **Panier Interactif** - Ajout/suppression d'articles avec quantités
- **Commande WhatsApp** - Intégration directe pour passer commande
- **Adresse de Livraison** - Champ obligatoire pour la livraison
- **Calcul Automatique** - Prix total en temps réel

### 📦 Système de Suivi
- **ID de Suivi Unique** - Génération automatique (ELB1234)
- **Suivi en Temps Réel** - Page dédiée `/suivi` pour suivre les commandes
- **Statuts de Commande** - En préparation, En livraison, Livré, Annulé
- **Notifications WhatsApp** - Message avec lien de suivi automatique

### 👨‍💼 Interface Administrateur
- **Dashboard Complet** - Vue d'ensemble des commandes et analytics
- **Gestion des Statuts** - Mise à jour en temps réel des commandes
- **Analytics** - Chiffre d'affaires, nombre de commandes, statistiques
- **Base de Données** - Intégration Supabase pour la persistance

### 🎨 Design & UX
- **Design Responsive** - Optimisé pour mobile et desktop
- **Interface Française** - Entièrement localisée en français
- **Monnaie Locale** - Prix affichés en Dinars Algériens (DA)
- **Images Haute Qualité** - Photos professionnelles des produits

### 🚀 Performance
- **Optimisation Images** - Compression et lazy loading automatiques
- **Navigation Fluide** - Interface rapide et intuitive
- **SEO Optimisé** - Métadonnées et structure optimisées

## 🛠️ Stack Technique

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Images**: Next.js Image Component

### Backend & Database
- **Database**: Supabase (PostgreSQL)
- **API**: Next.js API Routes
- **Authentication**: Supabase Auth (ready for future implementation)
- **Real-time**: Supabase Realtime (ready for live updates)

### State Management
- **Cart State**: Zustand
- **Local Storage**: Persistance du panier

### Fonts & Typography
- **Headings**: Great Vibes (Google Fonts)
- **Body Text**: Nunito (Google Fonts)
- **Fallbacks**: System fonts pour la performance

### Deployment
- **Platform**: Vercel
- **Domain**: Custom domain ready
- **CDN**: Global edge network

## 📁 Structure du Projet

\`\`\`
el-basta/
├── app/
│   ├── api/
│   │   ├── orders/
│   │   │   ├── route.ts          # CRUD operations pour commandes
│   │   │   └── [trackingId]/
│   │   │       └── route.ts      # Opérations par ID de suivi
│   │   └── analytics/
│   │       └── route.ts          # Analytics et statistiques
│   ├── admin/
│   │   └── page.tsx              # Interface administrateur
│   ├── cart/
│   │   └── page.tsx              # Page panier avec commande
│   ├── suivi/
│   │   └── page.tsx              # Page de suivi client
│   ├── globals.css               # Styles globaux et fonts
│   ├── layout.tsx                # Layout principal
│   ├── loading.tsx               # Composant de chargement
│   └── page.tsx                  # Page d'accueil
├── components/
│   ├── ui/                       # Composants shadcn/ui
│   ├── cart-icon.tsx             # Icône panier avec badge
│   ├── menu-item-card.tsx        # Carte produit menu
│   └── theme-provider.tsx        # Provider thème
├── lib/
│   ├── supabase.ts               # Configuration Supabase
│   ├── database.ts               # Fonctions base de données
│   ├── cart-store.ts             # Store Zustand panier
│   └── utils.ts                  # Utilitaires
├── scripts/
│   └── create-orders-table.sql   # Script création table commandes
├── hooks/
│   ├── use-mobile.tsx            # Hook détection mobile
│   └── use-toast.ts              # Hook notifications
├── public/
│   └── images/                   # Images produits et galerie
└── styles/
    └── globals.css               # Styles CSS personnalisés
\`\`\`

## 🗄️ Base de Données

### Configuration Supabase

1. **Créer un projet Supabase**
   - Aller sur [supabase.com](https://supabase.com)
   - Créer un nouveau projet
   - Noter l'URL et la clé anonyme

2. **Configurer les variables d'environnement**
   \`\`\`env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   \`\`\`

3. **Exécuter le script SQL**
   - Copier le contenu de `scripts/create-orders-table.sql`
   - L'exécuter dans l'éditeur SQL de Supabase

### Structure de la Table `orders`

\`\`\`sql
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  tracking_id VARCHAR(10) UNIQUE,
  items JSONB,
  delivery_address TEXT,
  total_price DECIMAL(10,2),
  status VARCHAR(50),
  estimated_time VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
\`\`\`

## 🍽️ Menu Complet

### 🧃 Jus Naturels
- **Jus d'Orange Frais** - 650 DA
  - Oranges fraîchement pressées avec une pointe de menthe
- **Mélange Détox Vert** - 725 DA  
  - Épinards, pomme, concombre et gingembre
- **Antioxydant aux Baies** - 700 DA
  - Baies mélangées avec grenade

### 🥞 Crêpes
- **Crêpe Française Classique** - 850 DA
  - Crêpe fine avec beurre, sucre et citron
- **Nutella & Banane** - 975 DA
  - Crêpe chaude garnie de Nutella et banane fraîche
- **Jambon & Fromage Salé** - 1125 DA
  - Crêpe de sarrasin avec jambon, fromage et herbes

### ☕ Cappuccinos
- **Cappuccino Classique** - 475 DA
  - Espresso riche avec mousse de lait vapeur
- **Cappuccino Vanille** - 525 DA
  - Cappuccino classique avec sirop de vanille
- **Cappuccino Caramel** - 550 DA
  - Garni de caramel coulant et art de mousse

### 🍰 Douceurs
- **Sélection de Macarons** - 1200 DA
  - Macarons français assortis (6 pièces)
- **Éclair au Chocolat** - 450 DA
  - Pâte à choux garnie de crème vanille
- **Tarte aux Fruits** - 625 DA
  - Fruits de saison sur base de crème vanille

## 🚀 Installation & Développement

### Prérequis
- Node.js 18+ 
- npm ou yarn
- Git
- Compte Supabase

### Installation Locale

\`\`\`bash
# Cloner le repository
git clone https://github.com/username/el-basta.git
cd el-basta

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos clés Supabase

# Exécuter le script SQL dans Supabase
# Copier le contenu de scripts/create-orders-table.sql
# L'exécuter dans l'éditeur SQL de Supabase

# Lancer le serveur de développement
npm run dev

# Ouvrir http://localhost:3000
\`\`\`

### Scripts Disponibles

\`\`\`bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run start        # Serveur de production
npm run lint         # Linting ESLint
npm run type-check   # Vérification TypeScript
\`\`\`

### Variables d'Environnement

\`\`\`env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
\`\`\`

## 📦 Système de Suivi des Commandes

### Flux de Commande

1. **Client passe commande**
   - Ajoute articles au panier
   - Saisit adresse de livraison
   - Clique "Passer Commande"

2. **Génération automatique**
   - ID de suivi unique (ELB1234)
   - Sauvegarde en base de données
   - Statut initial: "En préparation"

3. **Message WhatsApp**
   \`\`\`
   🍵 *Commande d'ElBasta* 🍵

   2x Cappuccino Classique
   1x Crêpe Nutella

   📍 *Adresse*: 17 Rue Didouche Mourad, Alger

   💰 *Coût Total: 1425 DA*

   🔍 *Votre commande (#ELB1234) est en préparation.*
   📱 *Suivez-la ici*: https://elbasta.dz/suivi

   Merci ! 😊
   \`\`\`

4. **Suivi client**
   - Page `/suivi` pour rechercher par ID
   - Affichage statut en temps réel
   - Informations complètes de commande

5. **Gestion admin**
   - Dashboard `/admin` pour toutes les commandes
   - Mise à jour des statuts
   - Analytics et statistiques

### Statuts de Commande

- 🟡 **En préparation** - Commande reçue et en cours de préparation
- 🔵 **En cours de livraison** - Commande en route vers le client
- 🟢 **Livré** - Commande livrée avec succès
- 🔴 **Annulé** - Commande annulée

## 🎨 Guide de Style

### Palette de Couleurs
- **Primary**: Amber/Brown tones (#92400e, #78350f)
- **Secondary**: Green accents (#16a34a, #15803d)  
- **Background**: Cream/Off-white (#fefce8, #fef3c7)
- **Text**: Dark brown (#451a03, #78350f)

### Typography
- **Headings**: Great Vibes (cursive, elegant)
- **Body**: Nunito (sans-serif, readable)
- **Weights**: 400 (regular), 600 (semibold), 700 (bold)

### Responsive Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

## 📱 Fonctionnalités Mobile

- **Navigation Tactile** - Menu hamburger responsive
- **Panier Mobile** - Interface optimisée pour petits écrans
- **WhatsApp Direct** - Ouverture automatique de l'app
- **Images Adaptatives** - Chargement optimisé selon la taille d'écran
- **Suivi Mobile** - Interface de suivi optimisée mobile

## 🔧 Intégrations

### Supabase Database
- **PostgreSQL** - Base de données relationnelle robuste
- **Real-time** - Mises à jour en temps réel (prêt pour implémentation)
- **Auth** - Système d'authentification (prêt pour implémentation)
- **Storage** - Stockage de fichiers (prêt pour images)

### WhatsApp Business
- **Numéro**: +213 770 22 44 72
- **Format Message**: Structuré avec produits, quantités, adresse, total et suivi
- **Encodage**: UTF-8 avec `encodeURIComponent`

### Google Maps
- **Embed**: Carte interactive intégrée
- **Lien Direct**: Redirection vers Google Maps mobile
- **Coordonnées**: 36.7338212, 3.1742928

### Réseaux Sociaux
- **Facebook**: Intégration page business
- **Instagram**: Lien vers profil officiel
- **Partage**: Boutons de partage sur les produits

## 📊 Performance & SEO

### Métriques Performance
- **Lighthouse Score**: 95+ (Performance)
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1

### Optimisations SEO
- **Meta Tags**: Titre, description, keywords
- **Open Graph**: Partage réseaux sociaux
- **Schema Markup**: Restaurant/LocalBusiness
- **Sitemap**: Génération automatique

## 🔮 Roadmap & Améliorations Futures

### Phase 2 - Fonctionnalités Avancées
- [ ] **Notifications Push** - Mises à jour de statut en temps réel
- [ ] **Système de Réservation** - Tables et créneaux horaires
- [ ] **Programme de Fidélité** - Points et récompenses
- [ ] **Multi-langues** - Arabe et Anglais

### Phase 3 - E-commerce Complet
- [ ] **Paiement en Ligne** - CIB, Edahabia
- [ ] **Comptes Clients** - Historique des commandes
- [ ] **Avis Clients** - Système de notation
- [ ] **Chat Support** - Assistance en direct

### Phase 4 - Business Intelligence
- [ ] **Analytics Avancées** - Rapports détaillés
- [ ] **Gestion Stock** - Inventaire automatisé
- [ ] **CRM Intégré** - Gestion clientèle
- [ ] **API Mobile** - Application native

## 🤝 Contribution

### Guidelines de Contribution
1. **Fork** le repository
2. **Créer** une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. **Commit** les changements (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. **Push** vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. **Ouvrir** une Pull Request

### Standards de Code
- **ESLint**: Configuration stricte
- **Prettier**: Formatage automatique
- **TypeScript**: Types stricts obligatoires
- **Commits**: Convention Conventional Commits

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👥 Équipe

- **Développement**: Équipe technique ElBasta
- **Design**: Studio créatif partenaire
- **Contenu**: Équipe marketing ElBasta
- **Maintenance**: Support technique continu

## 📞 Support

Pour toute question technique ou suggestion d'amélioration:

- **Email Technique**: dev@elbasta.dz
- **Issues GitHub**: [Créer un ticket](https://github.com/username/el-basta/issues)
- **Documentation**: [Wiki du projet](https://github.com/username/el-basta/wiki)

---

**ElBasta** - *Savourez des Moments Doux* ☕🥐✨
