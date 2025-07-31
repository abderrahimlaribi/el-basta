import { Metadata } from 'next';

export function generateMetadata(): Metadata {
  return {
    title: 'Conditions Générales - ElBasta',
    description: 'Consultez nos conditions générales de vente et d\'utilisation pour le salon de thé ElBasta à Alger.',
    alternates: {
      canonical: '/conditions',
    },
    openGraph: {
      title: 'Conditions Générales - ElBasta',
      description: 'Consultez nos conditions générales de vente et d\'utilisation pour le salon de thé ElBasta à Alger.',
      url: '/conditions',
      images: [
        {
          url: '/images/hero-background.jpg',
          width: 1200,
          height: 630,
          alt: 'Conditions Générales ElBasta',
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Conditions Générales - ElBasta',
      description: 'Consultez nos conditions générales de vente et d\'utilisation pour le salon de thé ElBasta à Alger.',
      images: ['/images/hero-background.jpg'],
    },
  };
}

// Static page that rarely changes
export const dynamic = 'force-static';