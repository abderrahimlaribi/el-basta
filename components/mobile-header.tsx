"use client"

import { useState } from "react"
import { Menu, X, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CartIcon } from "@/components/cart-icon"
import Link from "next/link"
import Image from "next/image"

export function MobileHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const menuItems = [
    { href: "#home", label: "Accueil" },
    { href: "#about", label: "À Propos" },
    { href: "#menu", label: "Menu" },
    { href: "#gallery", label: "Galerie" },
    { href: "#contact", label: "Contact" },
  ]

  return (
    <div className="md:hidden">
      {/* Mobile Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <div className="w-16 h-16 overflow-hidden">
                <Image src="/logo.png" alt="ElBasta Logo" width={64} height={64} className="w-full h-full object-contain" />
              </div>
            </div>

            {/* Right side - Cart and Menu */}
            <div className="flex items-center space-x-2">
              <CartIcon />
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMenu}
                className="p-2 hover:bg-green-100 rounded-full transition-colors duration-200"
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5 text-amber-900 drop-shadow-sm" />
                ) : (
                  <Menu className="w-5 h-5 text-amber-900 drop-shadow-sm" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={closeMenu}>
            <div className="absolute top-0 right-0 h-full w-80 bg-white shadow-2xl">
              <div className="p-6 h-full flex flex-col">
                {/* Header with close button */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center">
                    <div className="w-20 h-20 overflow-hidden">
                      <Image src="/logo.png" alt="ElBasta Logo" width={80} height={80} className="w-full h-full object-contain" />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={closeMenu}
                    className="p-2 hover:bg-green-100 rounded-full transition-colors duration-200"
                  >
                    <X className="w-5 h-5 text-amber-900" />
                  </Button>
                </div>

                {/* Menu items */}
                <div className="flex-1 space-y-2">
                  {menuItems.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={closeMenu}
                      className="block py-4 px-4 text-lg font-medium text-amber-900 hover:bg-green-50 rounded-xl transition-all duration-200 border border-transparent hover:border-green-200"
                    >
                      {item.label}
                    </a>
                  ))}

                  {/* Suivi link */}
                  <Link
                    href="/suivi"
                    onClick={closeMenu}
                    className="flex items-center py-4 px-4 text-lg font-medium text-amber-900 hover:bg-green-50 rounded-xl transition-all duration-200 border border-transparent hover:border-green-200"
                  >
                    <Package className="w-5 h-5 mr-3" />
                    Suivi
                  </Link>
                </div>


              </div>
            </div>
          </div>
        )}
      </nav>
    </div>
  )
} 
