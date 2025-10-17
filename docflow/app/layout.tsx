import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './global.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "DocFlow",
  description: "An intelligent document editor",
};

// ✅ Configuration viewport séparée (Next.js 14+)


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link
          rel="icon"
          href="/favicon-light.ico"
          media='(prefers-color-scheme: light)'
        />
        <link
          rel="icon"
          href="/favicon-dark.ico"
          media='(prefers-color-scheme: dark)'
        />
        <link rel="icon" href="/favicon-light.ico" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}