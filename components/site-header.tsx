"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icons } from '@/components/icons'
import { ConnectBtn } from '@/components/thirdweb/connect-btn'
import { APP_HOMEPAGE_URL, BOUNTY_CREATION_URL, CONSULTATION_CREATION_URL, FAQ_URL, LANDING_PAGE_URL } from '@/const/links'
import { cn } from '@/lib/utils'

// TODO: mobile responsiveness
// TODO: TBD create quest -> hover and expand nav menu for bounty and consultation request creation
export async function Header() {
  const pathname = usePathname()
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 max-w-screen-2xl items-center justify-between">
        <div className="container flex items-center justify-start gap-8">
          {/* TODO: switch logo back to next/link */}
          {/* <Link href="/" className="flex items-center space-x-2">
            <Icons.logo className="w-20 bg-white px-2" />
          </Link> */}
          <a href={LANDING_PAGE_URL} rel="noreferrer noopener" target="_blank" className=''>
            <Icons.logo className="w-20 bg-white px-2" />
          </a>
          <Link
            href={APP_HOMEPAGE_URL}
            className={cn(
              "transition-colors hover:text-foreground/80",
              pathname?.startsWith(APP_HOMEPAGE_URL)
                ? "text-foreground"
                : "text-foreground/60"
            )}
          >
            Explore
          </Link>
          <Link
            href={BOUNTY_CREATION_URL}
            className={cn(
              "transition-colors hover:text-foreground/80",
              pathname?.startsWith(BOUNTY_CREATION_URL)
                ? "text-foreground"
                : "text-foreground/60"
            )}
          >
            Create Bounty
          </Link>
          <Link
            href={CONSULTATION_CREATION_URL}
            className={cn(
              "transition-colors hover:text-foreground/80",
              pathname?.startsWith(CONSULTATION_CREATION_URL)
                ? "text-foreground"
                : "text-foreground/60"
            )}
          >
            Request Consultation
          </Link>
          <Link
            href={FAQ_URL}
            className={cn(
              "transition-colors hover:text-foreground/80",
              pathname?.startsWith(FAQ_URL)
                ? "text-foreground"
                : "text-foreground/60"
            )}
          >
            FAQ
          </Link>
        </div>
        <div className="container flex items-center justify-end gap-4">
          <ConnectBtn />
        </div>
      </div>
    </header>
  )
}
