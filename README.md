# ElBasta - Salon de Thé & Café Moderne

<div align="center">
  <br />
    <img src="public/images/hero-background.jpg" alt="ElBasta Project Banner" style="max-width: 100%; border-radius: 12px;" />
  <br />
  <div>
    <img src="https://img.shields.io/badge/-Next.JS-black?style=for-the-badge&logoColor=white&logo=nextdotjs&color=black" alt="next.js" />
    <img src="https://img.shields.io/badge/-Firebase-FF6C37?style=for-the-badge&logo=firebase&logoColor=white" alt="firebase" />
    <img src="https://img.shields.io/badge/-Tailwind-00BCFF?style=for-the-badge&logo=tailwind-css&logoColor=white" />
    <img src="https://img.shields.io/badge/-shadcn/ui-18181B?style=for-the-badge" alt="shadcn/ui" />
    <img src="https://img.shields.io/badge/-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="typescript" />
  </div>
  <h3 align="center">ElBasta - Salon de Thé & Café Moderne</h3>
  <div align="center">
    Commande en ligne, suivi en temps réel, et expérience premium pour les amateurs de thé et de douceurs à Alger.
  </div>
</div>

## 📋 Table of Contents

1. 🍵 [Introduction](#introduction)
2. ⚙️ [Tech Stack](#tech-stack)
3. ✨ [Features](#features)
4. 🤸 [Quick Start](#quick-start)
5. 🔧 [Firebase Setup](#firebase-setup)
6. 📷 [Cloudinary Setup](#cloudinary-setup)
7. 🔗 [Assets & Links](#assets)
8. 🚀 [More](#more)

## 🍵 Introduction

**ElBasta** est un salon de thé moderne situé à Alger, spécialisé dans les boissons artisanales, crêpes françaises, et douceurs faites maison. Ce projet Next.js propose une expérience de commande en ligne fluide, un suivi de commande en temps réel, et une interface administrateur complète. Il est optimisé pour le SEO, la performance, et l'accessibilité.

## ⚙️ Tech Stack

- **[Next.js](https://nextjs.org/)** (App Router, SSG/SSR/ISR, SEO)
- **[Firebase](https://firebase.google.com/)** (Firestore, Auth, Realtime Database)
- **[Tailwind CSS](https://tailwindcss.com/)** (UI rapide et responsive)
- **[shadcn/ui](https://ui.shadcn.com/)** (Composants modernes et accessibles)
- **[TypeScript](https://www.typescriptlang.org/)** (Typage strict)
- **[Zustand](https://zustand-demo.pmnd.rs/)** (Gestion d'état du panier)
- **[Lucide React](https://lucide.dev/)** (Icônes modernes)
- **[Cloudinary](https://cloudinary.com/)** (Stockage et optimisation images)
- **[Vercel](https://vercel.com/)** (Déploiement, Analytics, CDN)

## ✨ Features

- **Commande en ligne** : Panier interactif, calcul automatique, WhatsApp direct.
- **Suivi en temps réel** : Page `/suivi` pour suivre l'état de la commande.
- **Interface admin** : Dashboard, gestion statuts, analytics, CRUD produits.
- **SEO avancé** : Métadonnées dynamiques, Open Graph, Twitter Cards, sitemap, robots.txt, JSON-LD, canonical URLs.
- **Performance** : SSG/ISR, images optimisées, Lighthouse 95+, lazy loading, CDN Vercel.
- **Accessibilité** : Composants ARIA, navigation clavier, contrastes, alt images, heading hierarchy.
- **Design responsive** : Mobile-first, breakpoints optimisés, expérience fluide sur tous supports.
- **Intégrations** : Firebase Firestore, WhatsApp, Cloudinary, réseaux sociaux.
- **Sécurité** : Auth admin, validation côté client, bonnes pratiques Next.js.
- **Extensible** : Architecture modulaire, hooks personnalisés, composants réutilisables.

## 🤸 Quick Start

**Prerequisites**
- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/en) (version 18+)
- [npm](https://www.npmjs.com/) ou [pnpm](https://pnpm.io/)

**Cloning the Repository**
```bash
git clone https://github.com/username/el-basta.git
cd el-basta
```

**Installation**
```bash
npm install
# ou
pnpm install
```

**Set Up Environment Variables**
Créez un fichier `.env.local` à la racine :
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# Admin Authentication
NEXT_PUBLIC_ADMIN_HASHED_PASSWORD_BASE64=your_base64_hashed_password
```

**Running the Project**
```bash
npm run dev
```
Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 🔧 Firebase Setup

### 1. Créer un projet Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Cliquez sur "Créer un projet"
3. Entrez le nom de votre projet (ex: "el-basta")
4. Configurez Google Analytics (optionnel)
5. Cliquez sur "Créer le projet"

### 2. Configurer l'authentification

1. Dans la console Firebase, allez dans **Authentication**
2. Cliquez sur **Commencer**
3. Dans l'onglet **Sign-in method**, activez les méthodes souhaitées :
   - Email/Password (pour l'admin)
   - Google (optionnel)

### 3. Configurer Cloud Firestore

1. Dans la console Firebase, allez dans **Firestore Database**
2. Cliquez sur **Créer une base de données**
3. Choisissez le mode :
   - **Mode test** pour le développement
   - **Mode production** avec règles personnalisées
4. Sélectionnez l'emplacement de votre base de données (europe-west1 pour l'Europe)

### 4. Structure de la base de données

Créez les collections suivantes dans Firestore :

```

/config
-deliverySettings (array) // each item: { fee (number), min (number), max (number) }
-promotedProducts (array) // array of product IDs (string)
-serviceFees (number)
-storeSettings (map) // { openTime (string), closeTime (string), isDeliveryAvailable (boolean) }

/locations
-id (string)
-name (string)
-address (string)
-coordinates (map) // { lat (number), lng (number) }
-adminPhone (string)
-isActive (boolean)
-createdAt (timestamp)
-updatedAt (timestamp)

/products
-id (string)
-name (string)
-description (string)
-price (number)
-discountPrice (number)
-imageUrl (string)
-category (string)
-categoryId (string)
-status (string) // e.g. "normal", "promotion", "new"
-isAvailable (boolean)
-locationPrices (array) // each item: { locationId (string), price (number), isAvailable (boolean) }
-createdAt (timestamp)
-updatedAt (timestamp)

/orders
-id (string)
-customerName (string)
-customerPhone (string)
-customerNotes (string)
-deliveryAddress (string) // Google Maps link
-estimatedTime (string)
-items (array) // each item: {id (string), name (string), category (string), image (string), price (number), quantity (number), locationId (string), locationName (string)}
-totalPrice (number)
-status (string) // "pending", "confirmed", "preparing", "ready", "en cours de livraison", "delivered"
-trackingId (string)
-locationId (string) // ID of the selected store location
-locationName (string) // Name of the selected store location
-createdAt (timestamp)
-updatedAt (timestamp)

/categories
-name (string)
-slug (string)
```

### 5. Règles de sécurité Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read and write access to orders collection
    match /orders/{orderId} {
      allow read, write: if true;
    }

    // Allow read and write access to products collection
    match /products/{productId} {
      allow read, write: if true;
    }

    // Allow read and write access to categories collection
    match /categories/{categoryId} {
      allow read, write: if true;
    }

    // Allow read and write access to config collection
    match /config/{docId} {
      allow read, write: if true;
    }

    // Allow read and write access to locations collection
    match /locations/{locationId} {
      allow read, write: if true;
    }
  }
}
```

### 6. Configuration de l'application

1. Allez dans **Paramètres du projet** > **Général**
2. Faites défiler jusqu'à "Vos applications"
3. Cliquez sur l'icône Web (</>)
4. Enregistrez votre application avec un nom
5. Copiez les clés de configuration dans votre `.env.local`

## 📷 Cloudinary Setup

### 1. Créer un compte Cloudinary

1. Allez sur [Cloudinary](https://cloudinary.com/)
2. Créez un compte gratuit
3. Confirmez votre email

### 2. Obtenir les clés de configuration

1. Dans le **Dashboard** Cloudinary, trouvez :
   - **Cloud Name** (nom de votre cloud)
   - **API Key**
   - **API Secret**

### 3. Créer un Upload Preset

1. Allez dans **Settings** > **Upload**
2. Cliquez sur **Add upload preset**
3. Configurez votre preset :
   ```
   Preset name: el-basta-products
   Signing Mode: Unsigned (pour les uploads depuis le client)
   Folder: products/ (optionnel, pour organiser)
   ```
4. Dans **Incoming Transformations**, ajoutez :
   ```
   Transformation: Limit fit, Width: 800, Height: 600, Quality: auto
   Format: Auto (f_auto)
   ```
5. Sauvegardez le preset

### 4. Configuration des transformations automatiques

Pour optimiser les images automatiquement :

```javascript
// Exemple d'URL Cloudinary optimisée
const imageUrl = `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,w_400,h_300,q_auto,f_auto/${publicId}`;
```

### 5. Variables d'environnement

Ajoutez dans votre `.env.local` :
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=votre_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=el-basta-products
```

### 6. Utilisation dans le code

```javascript
// Upload d'image
const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
  
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );
  
  const data = await response.json();
  return data.secure_url;
};
```

## 🔗 Assets & Links

- [Site officiel ElBasta](https://elbasta.store)
- [Facebook](https://www.facebook.com/profile.php?id=61552378694624)
- [Instagram](https://www.instagram.com/elbasta.store/)
- [Google Maps](https://www.google.com/maps/place/ELBASTA/@36.7338212,3.1742928,17z)
- [Firebase Console](https://console.firebase.google.com/)
- [Cloudinary Dashboard](https://cloudinary.com/console)
- [Vercel](https://vercel.com/)

## 🚀 More

- **Documentation technique** : [Wiki du projet](https://github.com/username/el-basta/wiki)
- **Support** : dev@elbasta.store
- **Issues** : [Créer un ticket](https://github.com/username/el-basta/issues)
- **Licence** : MIT

---

<div align="center">
  <b>ElBasta</b> - Savourez des Moments Doux ☕🥐✨
</div>