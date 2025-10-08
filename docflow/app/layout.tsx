import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './global.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DocFlow - Create intelligent documents with AI',
  description: 'An intelligent document editor that combines the power of AI with an intuitive interface to create, edit and organize your professional documents.',
  keywords: ['documents', 'AI', 'editor', 'productivity', 'writing'],
  authors: [{ name: 'DocFlow Team' }],
  viewport: 'width=device-width, initial-scale=1',
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