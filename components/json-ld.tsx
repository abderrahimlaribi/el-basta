import React from 'react';

interface JsonLdProps {
  data: Record<string, any>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function LocalBusinessJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'CafeOrCoffeeShop',
    name: 'ElBasta',
    description: 'Salon de thé moderne à Alger avec des boissons artisanales, crêpes françaises et douceurs faites maison.',
    url: 'https://elbasta.store',
    telephone: '+213XXXXXXXXX', // Replace with actual phone number
    email: 'contact@elbasta.store', // Replace with actual email
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Adresse du salon', // Replace with actual address
      addressLocality: 'Alger',
      addressRegion: 'Alger',
      postalCode: '16000',
      addressCountry: 'DZ'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 36.7338212,
      longitude: 3.1742928
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '08:00',
        closes: '23:00'
      }
    ],
    priceRange: '$$',
    servesCuisine: ['Café', 'Thé', 'Crêpes', 'Pâtisseries'],
    image: 'https://elbasta.store/images/hero-background.jpg',
    sameAs: [
      'https://www.facebook.com/elbasta',
      'https://www.instagram.com/elbasta'
    ]
  };

  return <JsonLd data={data} />;
}

export function ProductJsonLd({ product }: { product: any }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.imageUrl,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'DZD',
      availability: 'https://schema.org/InStock',
      url: `https://elbasta.store/products/${product.id}`
    }
  };

  return <JsonLd data={data} />;
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };

  return <JsonLd data={data} />;
}