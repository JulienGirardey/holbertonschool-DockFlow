import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './global.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NODE_ENV === 'production' ? 'https://docflow.com' : 'http://localhost:3000'),
  title: {
    default: 'DocFlow',
    template: '%s | DocFlow' // Pages: "Dashboard | DocFlow"
  },
  description: 'An intelligent document editor that combines the power of AI...',
  keywords: ['documents', 'AI', 'editor', 'productivity', 'writing'],
  authors: [{ name: 'DocFlow Team', url: 'https://docflow.com' }],
  creator: 'DocFlow Team',
  
  // SEO avancé
  robots: {
    index: true,
    follow: true,
  },
  
  // Réseaux sociaux
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://docflow.com',
    siteName: 'DocFlow',
    images: ['/og-image.png'],
  },
  
  // PWA
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'DocFlow',
  },
}

// ✅ Configuration viewport séparée (Next.js 14+)
export function generateViewport(): Viewport {
  return {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: [
      { media: '(prefers-color-scheme: light)', color: '#3b82f6' },
      { media: '(prefers-color-scheme: dark)', color: '#1e293b' }
    ]
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body className={inter.className}>
        <div id="root">
          {children}
        </div>
        
        {/* Portal for modals */}
        <div id="modal-root"></div>
        
        {/* Loading overlay */}
        <div id="loading-root"></div>
      </body>
    </html>
  )
}