import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../src/index.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GOPRO - Global Operational Performance Reporting & Optimization',
  description: 'Go in the field, perform like a pro. Global Operational Performance Reporting & Optimization platform.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

