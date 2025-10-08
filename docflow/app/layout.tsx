import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import './global.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DocFlow - Create intelligent documents with AI',
  description: 'An intelligent document editor that combines the power of AI with an intuitive interface to create, edit and organize your professional documents.',
  keywords: ['documents', 'AI', 'editor', 'productivity', 'writing'],
  authors: [{ name: 'DocFlow Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    // Simulate page load
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [pathname]);

  if (isLoading) {
    return (
      <div className="flex-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full"></div>
      </div>
    );
  }

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body className={inter.className}>
        <div id="root" className={`min-h-screen animate-fadeInUp`}>
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