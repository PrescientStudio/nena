"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from '../contexts/AuthContext'

interface NavLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

const NavLink = ({ href, children, className, onClick }: NavLinkProps) => (
  <Link
    href={href}
    className={`text-gray-700 hover:text-blue-600 hover:bg-blue-50/50 px-3 py-2 text-sm font-medium transition-colors duration-200 rounded ${className || ''}`}
    onClick={onClick}
  >
    {children}
  </Link>
)

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()

  const toggleMenu = (): void => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = (): void => {
    setIsMenuOpen(false)
  }

  const handleSignIn = (): void => {
    router.push("/auth/login")
    closeMenu()
  }

  const handleLogout = (): void => {
    logout()
    closeMenu()
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
              Nena
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-4">
            <NavLink href="/">Home</NavLink>
            {isAuthenticated && <NavLink href="/dashboard">Dashboard</NavLink>}
            <NavLink href="/pricing">Pricing</NavLink>
          </nav>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {user?.name && (
                  <span className="text-gray-700 text-sm font-medium">
                    Welcome, {user.name}
                  </span>
                )}
                <Button
                  onClick={handleLogout}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 transition-colors duration-200 shadow-sm hover:shadow"
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button
                onClick={handleSignIn}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 transition-colors duration-200 shadow-sm hover:shadow"
              >
                Sign In
                </Button>
            )}
            </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-blue-600 p-2 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
      </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              <NavLink
                href="/"
                className="block w-full text-base"
                onClick={closeMenu}
              >
                Home
              </NavLink>
              {isAuthenticated && (
                <NavLink
                  href="/dashboard"
                  className="block w-full text-base"
                  onClick={closeMenu}
                >
                  Dashboard
                </NavLink>
              )}
              <NavLink
                href="/pricing"
                className="block w-full text-base"
                onClick={closeMenu}
              >
                Pricing
              </NavLink>
              <div className="pt-4 pb-2">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    {user?.name && (
                      <div className="text-gray-700 text-sm font-medium px-3">
                        Welcome, {user.name}
                      </div>
                    )}
                    <Button
                      onClick={handleLogout}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 transition-all duration-200 shadow-sm hover:shadow"
                    >
                      Logout
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={handleSignIn}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 transition-all duration-200 shadow-sm hover:shadow"
                  >
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

