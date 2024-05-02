"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Award, Bell, Menu, ShieldCheck } from 'lucide-react'
import { Icons } from '@/components/icons'
import { ConnectBtn } from '@/components/thirdweb/connect-btn'
import { APP_HOMEPAGE_URL, BOUNTY_CREATION_URL, CONSULTATION_CREATION_URL, FAQ_URL, LANDING_PAGE_URL, PROFILE_URL } from '@/const/links'
import { cn } from '@/lib/utils'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export function Header() {
  const pathname = usePathname()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 max-w-screen-2xl items-center justify-between gap-4">
        <div className="flex items-center justify-start md:gap-6 gap-2">
          {/* mobile menu */}
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger className="md:hidden block">
              <Menu className="h-6 w-6" />
            </SheetTrigger>
            <SheetContent side="left" className='flex flex-col'>
              <Link href={APP_HOMEPAGE_URL} className="flex items-center space-x-2" onClick={() => setMobileNavOpen(false)}>
                <Icons.logo className="w-20 bg-white px-2" />
              </Link>

              <Link
                href={APP_HOMEPAGE_URL}
                className={cn(
                  "transition-colors hover:text-foreground/80",
                  pathname && pathname === APP_HOMEPAGE_URL
                    ? "text-foreground"
                    : "text-foreground/60"
                )}
                onClick={() => setMobileNavOpen(false)}
              >
                Explore
              </Link>
              {/* TODO: TBD create quest -> hover and expand nav menu for bounty and consultation request creation */}
              <Link
                href={BOUNTY_CREATION_URL}
                className={cn(
                  "transition-colors hover:text-foreground/80",
                  pathname?.startsWith(BOUNTY_CREATION_URL)
                    ? "text-foreground"
                    : "text-foreground/60"
                )}
                onClick={() => setMobileNavOpen(false)}
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
                onClick={() => setMobileNavOpen(false)}
              >
                Request Consultation
              </Link>
              <a href={FAQ_URL} rel="noreferrer noopener" target="_blank" className="transition-colors text-foreground/60 hover:text-foreground/80">
                FAQ
              </a>

              {/* TODO: start here - hide these buttons if user is not logged in */}
              {/* TODO: TBD - where to link this route to? */}
              <Link href={PROFILE_URL} className="transition-colors text-foreground/60 hover:text-foreground/80" onClick={() => setMobileNavOpen(false)}>
                <Award className="h-6 w-6" />
              </Link>

              {/* TODO: TBD - where to link this route to? */}
              <Link href={PROFILE_URL} className="transition-colors text-foreground/60 hover:text-foreground/80" onClick={() => setMobileNavOpen(false)}>
                <ShieldCheck className="h-6 w-6" />
              </Link>
              {/* TODO: end here - hide these buttons if user is not logged in */}


              {/* TODO: only display this about juku route when user's not logged */}
              <a href={LANDING_PAGE_URL} rel="noreferrer noopener" target="_blank" className="transition-colors text-foreground/60 hover:text-foreground/80">
                About Juku
              </a>

            </SheetContent>
          </Sheet>
          {/* end of mobile menu */}

          <Link href={APP_HOMEPAGE_URL} className="flex items-center space-x-2">
            <Icons.logo className="w-20 bg-white px-2" />
          </Link>

          <Link
            href={APP_HOMEPAGE_URL}
            className={cn(
              "transition-colors hover:text-foreground/80 md:block hidden",
              pathname && pathname === APP_HOMEPAGE_URL
                ? "text-foreground"
                : "text-foreground/60"
            )}
          >
            Explore
          </Link>
          {/* TODO: TBD create quest -> hover and expand nav menu for bounty and consultation request creation */}
          <Link
            href={BOUNTY_CREATION_URL}
            className={cn(
              "transition-colors hover:text-foreground/80 md:block hidden",
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
              "transition-colors hover:text-foreground/80 md:block hidden",
              pathname?.startsWith(CONSULTATION_CREATION_URL)
                ? "text-foreground"
                : "text-foreground/60"
            )}
          >
            Request Consultation
          </Link>
          <a href={FAQ_URL} rel="noreferrer noopener" target="_blank" className="transition-colors text-foreground/60 hover:text-foreground/80 md:block hidden">
            FAQ
          </a>

        </div>
        <div className="flex items-center justify-end gap-4">
          {/* TODO: start here - hide these buttons if user is not logged in */}
          {/* TODO: TBD - where to link this route to? */}
          <Link href={PROFILE_URL} className="transition-colors text-foreground/60 hover:text-foreground/80 md:block hidden">
            <Award className="h-6 w-6" />
          </Link>

          {/* TODO: TBD - where to link this route to? */}
          <Link href={PROFILE_URL} className="transition-colors text-foreground/60 hover:text-foreground/80 md:block hidden">
            <ShieldCheck className="h-6 w-6" />
          </Link>

          <Sheet>
            <SheetTrigger className="transition-colors text-foreground/60 hover:text-foreground/80">
              {/* TODO: determine if there is notification, show BellDot, else show Bell */}
              <Bell className="h-6 w-6" />
              {/* <Icons.bellDot className="h-6 w-6" /> */}
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Notifications</SheetTitle>
                <SheetDescription>
                  {/* TODO: add notification list here */}
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
          {/* TODO: TBD - logged in profile: reuse Thirdweb Connect UI or follow the wireframe */}
          {/* TODO: end here - hide these buttons if user is not logged in */}

          {/* TODO: only display this about juku route when user's not logged */}
          <a href={LANDING_PAGE_URL} rel="noreferrer noopener" target="_blank" className="transition-colors text-foreground/60 hover:text-foreground/80 md:block hidden">
            About Juku
          </a>

          <ConnectBtn />
        </div>
      </div>
    </header >
  )
}
