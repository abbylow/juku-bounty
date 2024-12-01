import type { Metadata } from 'next'
import { Inter as FontSans } from 'next/font/google'
import { CategoryProvider } from '@/contexts/categories'
import TanStackProvider from '@/contexts/tanstack'
import { TwebProvider } from '@/contexts/thirdweb'
import { ViewerProvider } from '@/contexts/viewer'
import { Footer } from '@/components/site-footer'
import { Header } from '@/components/site-header'
import { Toaster } from '@/components/ui/toaster'
import { cn } from '@/lib/utils'

import './globals.css'

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

// TODO: update metadata
// TODO: add manifest
export const metadata: Metadata = {
  title: 'Juku',
  description: 'Generated by create next app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased",
        fontSans.variable
      )}>
        <TanStackProvider>
          <TwebProvider>
            <ViewerProvider>
              <CategoryProvider>
                <div className="relative min-h-screen flex flex-col bg-background">
                  <Header />
                  <main className="flex-1 container">
                    {children}
                  </main>
                  <Footer />
                  <Toaster />
                </div>
              </CategoryProvider>
            </ViewerProvider>
          </TwebProvider>
        </TanStackProvider>
      </body>
    </html>
  )
}
