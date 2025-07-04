# ElBasta - Salon de Thé & Café 🍵☕

*Automatically synced with your [v0.dev](https://v0.dev) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/abderrahimlaribis-projects/v0-recreate-ui-from-screenshot)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/AgWYLeJw8jZ)

## 🏪 About ElBasta

ElBasta is a modern, elegant tea room and café website built with cutting-edge web technologies. This project showcases a complete digital experience for a 24/7 café located in Alger, Algeria, featuring an interactive menu, shopping cart system, and seamless WhatsApp ordering integration.

## ✨ Features

### 🎨 **Modern Design**
- **Responsive Layout**: Optimized for desktop, tablet, and mobile devices
- **Custom Typography**: Great Vibes for decorative headings, Nunito for body text
- **Elegant Color Scheme**: Warm browns and creams reflecting café aesthetics
- **GSAP Animations**: Smooth, professional animations throughout the site

### 🛒 **E-Commerce Functionality**
- **Interactive Menu**: Browse through categories (Jus Naturels, Crêpes, Cappuccinos, Douceurs)
- **Shopping Cart**: Add/remove items with real-time quantity updates
- **Cart Badge**: Visual indicator showing item count in navigation
- **Price Calculation**: Automatic total calculation in DZD (Algerian Dinar)

### 📱 **WhatsApp Integration**
- **Direct Ordering**: One-click order placement via WhatsApp
- **Formatted Messages**: Automatically generated order summaries
- **Contact Integration**: Direct link to business WhatsApp (+213 770 22 44 72)

### 🌐 **Multilingual Support**
- **French Interface**: Complete French localization
- **Cultural Adaptation**: Pricing in DZD, local business hours (24h/24)
- **Regional Contact**: Algerian phone numbers and social media

### 🗺️ **Location Services**
- **Google Maps Integration**: Interactive map showing exact location
- **Address Information**: ElBasta, Alger, Algérie
- **Navigation Links**: Direct links to Google Maps for directions

## 🛠️ Tech Stack

### **Frontend Framework**
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework

### **UI Components**
- **shadcn/ui**: Modern, accessible component library
- **Lucide React**: Beautiful icon library
- **Custom Components**: Specialized menu and cart components

### **State Management**
- **Zustand**: Lightweight state management for cart functionality
- **React Hooks**: Built-in state management for UI interactions

### **Animations & Interactions**
- **GSAP (GreenSock)**: Professional-grade animations
- **Framer Motion**: React animation library
- **CSS Transitions**: Smooth hover effects and transitions

### **Development Tools**
- **ESLint**: Code linting and formatting
- **PostCSS**: CSS processing and optimization
- **Git**: Version control with automated syncing

## 📁 Project Structure

\`\`\`
el-basta/
├── app/                          # Next.js App Router
│   ├── cart/                     # Shopping cart page
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   ├── loading.tsx              # Loading component
│   └── page.tsx                 # Homepage
├── components/                   # React components
│   ├── ui/                      # shadcn/ui components
│   ├── cart-icon.tsx           # Cart navigation icon
│   ├── menu-item-card.tsx      # Menu item display
│   └── theme-provider.tsx      # Theme context
├── hooks/                       # Custom React hooks
│   ├── use-gsap.ts             # GSAP animation hook
│   ├── use-mobile.tsx          # Mobile detection
│   └── use-toast.ts            # Toast notifications
├── lib/                         # Utility libraries
│   ├── cart-store.ts           # Zustand cart store
│   └── utils.ts                # Helper functions
├── public/                      # Static assets
│   └── images/                 # Product and gallery images
├── styles/                      # Additional stylesheets
└── tailwind.config.ts          # Tailwind configuration
\`\`\`

## 🎯 Key Pages & Components

### **Homepage (`app/page.tsx`)**
- Hero section with background imagery
- About section with business information
- Interactive menu with categories
- Image gallery carousel
- Contact information with map
- Social media links

### **Cart Page (`app/cart/page.tsx`)**
- Shopping cart summary
- Quantity adjustment controls
- Total price calculation
- WhatsApp order button
- Empty cart handling

### **Menu Item Card (`components/menu-item-card.tsx`)**
- Product image display
- Name and price information
- Add to cart functionality
- Responsive design

### **Cart Store (`lib/cart-store.ts`)**
- Zustand-based state management
- Add/remove item functions
- Quantity management
- Total calculation
- Persistent cart state

## 🌟 Business Information

### **Contact Details**
- **Name**: ElBasta
- **Phone**: 0770 22 44 72
- **WhatsApp**: +213 770 22 44 72
- **Email**: contact@elbasta.dz
- **Hours**: 24h/24, tous les jours (Open 24/7)

### **Location**
- **Address**: ElBasta, Alger, Algérie
- **Google Maps**: [View Location](https://www.google.com/maps/place/ELBASTA/@36.7338212,3.1742928,17z)
- **Coordinates**: 36.7338212, 3.1742928

### **Social Media**
- **Facebook**: [ElBasta Facebook](https://www.facebook.com/profile.php?id=61552378694624)
- **Instagram**: [@elbasta.dz](https://www.instagram.com/elbasta.dz/)

## 🍽️ Menu Categories

### **🧃 Jus Naturels (Natural Juices)**
- Jus d'Orange Frais (15,00 DA)
- Smoothie Détox Vert (18,00 DA)
- Jus Antioxydant aux Baies (20,00 DA)

### **🥞 Crêpes**
- Crêpe Française Classique (12,00 DA)
- Crêpe Nutella & Banane (16,00 DA)
- Crêpe Salée Jambon & Fromage (18,00 DA)

### **☕ Cappuccinos**
- Cappuccino Classique (8,00 DA)
- Cappuccino à la Vanille (10,00 DA)
- Cappuccino au Caramel (12,00 DA)

### **🍰 Douceurs (Sweets)**
- Macarons Français (25,00 DA)
- Éclair au Chocolat (15,00 DA)
- Tarte aux Fruits de Saison (20,00 DA)

## 🚀 Deployment

### **Live Website**
- **Production**: [Vercel Deployment](https://vercel.com/abderrahimlaribis-projects/v0-recreate-ui-from-screenshot)
- **Development**: Continue building on [v0.dev](https://v0.dev/chat/projects/AgWYLeJw8jZ)

### **Deployment Process**
1. Changes made in v0.dev chat interface
2. Automatic sync to GitHub repository
3. Vercel deployment triggered on push
4. Live site updated automatically

## 🔧 Development

### **Getting Started**
\`\`\`bash
# Clone the repository
git clone https://github.com/abderrahimlaribi/el-basta.git

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
\`\`\`

### **Environment Setup**
- Node.js 18+ required
- Next.js 15 with App Router
- TypeScript configuration included
- Tailwind CSS pre-configured

## 🎨 Design System

### **Typography**
- **Headings**: Great Vibes (decorative, elegant)
- **Body Text**: Nunito (clean, readable)
- **Responsive**: Fluid typography scaling

### **Colors**
- **Primary**: Warm browns (#8B4513, #D2691E)
- **Secondary**: Cream and beige tones
- **Accent**: Gold highlights
- **Text**: Dark brown for readability

### **Spacing**
- **Consistent**: 8px grid system
- **Responsive**: Mobile-first approach
- **Accessibility**: WCAG compliant spacing

## 📱 Mobile Optimization

### **Responsive Features**
- Mobile-first design approach
- Touch-friendly interface elements
- Optimized images for mobile bandwidth
- Swipe gestures for gallery navigation

### **Performance**
- Next.js Image optimization
- Lazy loading for images
- Minimal JavaScript bundle
- Fast loading times

## 🔮 Future Enhancements

### **Planned Features**
- [ ] Arabic language support
- [ ] Online payment integration
- [ ] Delivery tracking system
- [ ] Customer loyalty program
- [ ] Table reservation system
- [ ] Real-time order notifications
- [ ] Customer reviews and ratings
- [ ] Seasonal menu updates

### **Technical Improvements**
- [ ] PWA (Progressive Web App) support
- [ ] Offline functionality
- [ ] Push notifications
- [ ] Advanced analytics
- [ ] SEO optimization
- [ ] Performance monitoring

## 👥 Contributors

- **Abderrahim Laribi** - [@abderrahimlaribi](https://github.com/abderrahimlaribi)
- **v0.dev** - AI-powered development platform

## 📄 License

This project is developed for ElBasta café and is proprietary software. All rights reserved.

---

**Built with ❤️ using v0.dev and deployed on Vercel**

*Last updated: January 2025*
