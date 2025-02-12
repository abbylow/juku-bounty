import type { Metadata } from 'next'
import { Anek_Latin as FontSans } from "next/font/google";
import { CategoryProvider } from '@/contexts/categories'
import TanStackProvider from '@/contexts/tanstack'
import { TwebProvider } from '@/contexts/thirdweb'
import { ViewerProvider } from '@/contexts/viewer'
import { Footer } from '@/components/site-footer'
import { Header } from '@/components/site-header'
import { Toaster } from '@/components/ui/toaster'
import { cn } from '@/lib/utils'

import './globals.css'

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: 'Juku',
  description: 'Open Knowledge Network',
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
