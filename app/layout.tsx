import type React from "react"
import type { Metadata } from "next"
import { Great_Vibes, Nunito } from "next/font/google"
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
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${greatVibes.variable} ${nunito.variable}`}>
      <body className="font-body antialiased">{children}</body>
    </html>
  )
}
