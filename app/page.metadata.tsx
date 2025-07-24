import { Metadata } from 'next';

export function generateMetadata(): Metadata {
  return {
    title: 'ElBasta - Salon de Thé & Café Moderne à Alger',
    description: 'Découvrez notre salon de thé moderne à Alger avec des boissons artisanales, crêpes françaises et douceurs faites maison. Commandez en ligne ou sur place.',
    alternates: {
      canonical: '/',
    },
    openGraph: {
      title: 'ElBasta - Salon de Thé & Café Moderne à Alger',
      description: 'Découvrez notre salon de thé moderne à Alger avec des boissons artisanales, crêpes françaises et douceurs faites maison. Commandez en ligne ou sur place.',
      url: '/',
      images: [
        {
          url: '/images/hero-background.jpg',
          width: 1200,
          height: 630,
          alt: 'ElBasta - Salon de Thé & Café Moderne',
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'ElBasta - Salon de Thé & Café Moderne à Alger',
      description: 'Découvrez notre salon de thé moderne à Alger avec des boissons artisanales, crêpes françaises et douceurs faites maison. Commandez en ligne ou sur place.',
      images: ['/images/hero-background.jpg'],
    },
  };
}

export const dynamic = 'force-static';
