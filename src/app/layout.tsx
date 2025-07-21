import { Inter } from 'next/font/google'
import './globals.css'
import { Metadata } from 'next'
import ClientProviders from '../components/ClientProviders'
import HydrationWrapper from '../components/HydrationWrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "Nena - AI Speech Coaching",
  description: "Transform your communication with AI-powered speech coaching",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <HydrationWrapper>
        <ClientProviders>
          {children}
        </ClientProviders>
        </HydrationWrapper>
      </body>
    </html>
  )
}