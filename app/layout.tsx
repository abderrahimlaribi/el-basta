import type React from "react"
import type { Metadata } from "next"
import { Great_Vibes, Nunito } from "next/font/google"
import Script from 'next/script'
import { GA_TRACKING_ID } from '@/lib/gtag'
import "./globals.css"

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-great-vibes",
  display: "swap",
})

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-nunito",
  display: "swap",
})

export const metadata: Metadata = {
  title: "ElBasta - Savourez des Moments Doux",
  description:
    "Découvrez le mélange parfait de tranquillité et de goût avec nos thés soigneusement préparés, jus frais, crêpes artisanales et douceurs délicieuses.",
  generator: 'Next.js',
  applicationName: 'ElBasta',
  referrer: 'origin-when-cross-origin',
  keywords: ['salon de thé', 'café', 'Alger', 'crêpes', 'thé', 'livraison', 'commande en ligne'],
  authors: [{ name: 'ElBasta', url: 'https://elbasta.store' }],
  creator: 'ElBasta',
  publisher: 'ElBasta',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://elbasta.store'),
  alternates: {
    canonical: '/',
    languages: {
      'fr-DZ': '/',
    },
  },
  openGraph: {
    title: 'ElBasta - Salon de Thé & Café Moderne',
    description: 'Découvrez le mélange parfait de tranquillité et de goût avec nos thés soigneusement préparés, jus frais, crêpes artisanales et douceurs délicieuses.',
    url: 'https://elbasta.store',
    siteName: 'ElBasta',
    images: [
      {
        url: '/images/hero-background.jpg',
        width: 1200,
        height: 630,
        alt: 'ElBasta - Salon de Thé & Café Moderne',
      },
    ],
    locale: 'fr_DZ',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ElBasta - Salon de Thé & Café Moderne',
    description: 'Découvrez le mélange parfait de tranquillité et de goût avec nos thés soigneusement préparés, jus frais, crêpes artisanales et douceurs délicieuses.',
    images: ['/images/hero-background.jpg'],
    creator: '@elbasta',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/favicon-32x32.png',
    apple: '/apple-touch-icon.png',
  },
  verification: {
    google: 'google-site-verification-code', // Replace with actual verification code
  },
  category: 'food',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${greatVibes.variable} ${nunito.variable}`}>
      <head>
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#4d7c0f" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        {/* Google Analytics */}
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
        />
        <Script
          id="gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_TRACKING_ID}', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
        {/* End Google Analytics */}
      </head>
      <body className="font-body antialiased">{children}</body>
    </html>
  )
}
