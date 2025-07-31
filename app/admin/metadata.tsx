import { Metadata } from 'next';

export function generateMetadata(): Metadata {
  return {
    title: 'Administration - ElBasta',
    description: 'Panneau d\'administration pour ElBasta, salon de thé moderne à Alger.',
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
      },
    },
    alternates: {
      canonical: '/admin',
    },
    openGraph: {
      title: 'Administration - ElBasta',
      description: 'Panneau d\'administration pour ElBasta, salon de thé moderne à Alger.',
      url: '/admin',
      images: [
        {
          url: '/images/hero-background.jpg',
          width: 1200,
          height: 630,
          alt: 'Administration ElBasta',
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Administration - ElBasta',
      description: 'Panneau d\'administration pour ElBasta, salon de thé moderne à Alger.',
      images: ['/images/hero-background.jpg'],
    },
  };
}

// Admin dashboard needs real-time data
export const dynamic = 'force-dynamic';