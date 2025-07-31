import { Metadata } from 'next';

export function generateMetadata(): Metadata {
  return {
    title: 'Votre Panier - ElBasta',
    description: 'Consultez et modifiez votre panier avant de finaliser votre commande chez ElBasta, salon de thé moderne à Alger.',
    alternates: {
      canonical: '/cart',
    },
    openGraph: {
      title: 'Votre Panier - ElBasta',
      description: 'Consultez et modifiez votre panier avant de finaliser votre commande chez ElBasta, salon de thé moderne à Alger.',
      url: '/cart',
      images: [
        {
          url: '/images/hero-background.jpg',
          width: 1200,
          height: 630,
          alt: 'Panier ElBasta',
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Votre Panier - ElBasta',
      description: 'Consultez et modifiez votre panier avant de finaliser votre commande chez ElBasta, salon de thé moderne à Alger.',
      images: ['/images/hero-background.jpg'],
    },
  };
}

// Cart page should be dynamic as it contains user-specific content
export const dynamic = 'force-dynamic';