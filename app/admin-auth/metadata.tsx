import { Metadata } from 'next';

export function generateMetadata(): Metadata {
  return {
    title: 'Authentification Admin - ElBasta',
    description: 'Page d\'authentification pour l\'administration d\'ElBasta, salon de thé moderne à Alger.',
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
      canonical: '/admin-auth',
    },
    openGraph: {
      title: 'Authentification Admin - ElBasta',
      description: 'Page d\'authentification pour l\'administration d\'ElBasta, salon de thé moderne à Alger.',
      url: '/admin-auth',
      images: [
        {
          url: '/images/hero-background.jpg',
          width: 1200,
          height: 630,
          alt: 'Authentification Admin ElBasta',
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Authentification Admin - ElBasta',
      description: 'Page d\'authentification pour l\'administration d\'ElBasta, salon de thé moderne à Alger.',
      images: ['/images/hero-background.jpg'],
    },
  };
}

// Auth page should be dynamic for security
export const dynamic = 'force-dynamic';