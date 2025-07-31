import { Metadata } from 'next';

export function generateMetadata(): Metadata {
  return {
    title: 'Suivi de Commande - ElBasta',
    description: 'Suivez en temps réel l\'état de votre commande chez ElBasta, salon de thé moderne à Alger.',
    alternates: {
      canonical: '/suivi',
    },
    openGraph: {
      title: 'Suivi de Commande - ElBasta',
      description: 'Suivez en temps réel l\'état de votre commande chez ElBasta, salon de thé moderne à Alger.',
      url: '/suivi',
      images: [
        {
          url: '/images/hero-background.jpg',
          width: 1200,
          height: 630,
          alt: 'Suivi de Commande ElBasta',
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Suivi de Commande - ElBasta',
      description: 'Suivez en temps réel l\'état de votre commande chez ElBasta, salon de thé moderne à Alger.',
      images: ['/images/hero-background.jpg'],
    },
  };
}

// Order tracking page needs real-time updates
export const dynamic = 'force-dynamic';
export const revalidate = 30; // Revalidate every 30 seconds