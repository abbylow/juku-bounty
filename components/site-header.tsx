"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Award, Bell, BellDot, ShieldCheck } from 'lucide-react'
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

// TODO: mobile responsiveness
// TODO: logged in view - profile, notification, verified badge, platform point
// TODO: TBD create quest -> hover and expand nav menu for bounty and consultation request creation
export function Header() {
  const pathname = usePathname()
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 max-w-screen-2xl items-center justify-between gap-4">
        <div className="flex items-center justify-start gap-8">
          {/* TODO: switch logo back to next/link */}
          {/* <Link href="/" className="flex items-center space-x-2">
            <Icons.logo className="w-20 bg-white px-2" />
          </Link> */}
          <a href={LANDING_PAGE_URL} rel="noreferrer noopener" target="_blank">
            <Icons.logo className="w-20 bg-white" />
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
          <a href={FAQ_URL} rel="noreferrer noopener" target="_blank" className="transition-colors text-foreground/60 hover:text-foreground/80">
            FAQ
          </a>

        </div>
        <div className="flex items-center justify-end gap-4">
          {/* TODO: start here - hide these buttons if user is not logged in */}
          {/* TODO: TBD - where to link this route to? */}
          <Link href={PROFILE_URL}>
            <Award className="h-6 w-6" />
          </Link>

          {/* TODO: TBD - where to link this route to? */}
          <Link href={PROFILE_URL}>
            <ShieldCheck className="h-6 w-6" />
          </Link>

          <Sheet>
            <SheetTrigger>
              {/* TODO: determine if there is notification, show BellDot, else show Bell */}
              {/* <Bell className="h-6 w-6" /> */}
              <BellDot className="h-6 w-6" />
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

          <ConnectBtn />
        </div>
      </div>
    </header >
  )
}
