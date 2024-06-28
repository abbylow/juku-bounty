"use client"

import { ComponentPropsWithoutRef, ElementRef, forwardRef, useState } from 'react'
import Link from 'next/link'
import { Bell, Menu, CircleUserRound, Sprout, Settings } from 'lucide-react'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

import { useTwebContext } from "@/components/thirdweb/thirdweb-provider";
import { Icons } from '@/components/icons'
import { ConnectBtn } from '@/components/thirdweb/connect-btn'
import { APP_HOMEPAGE_URL, BOUNTY_CREATION_URL, CONSULTATION_CREATION_URL, LANDING_PAGE_URL, PLATFROM_QUEST_URL, PROFILE_SETTINGS_URL, PROFILE_URL } from '@/const/links'
import { cn } from '@/lib/utils'
// import { Icons } from "@/components/icons"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export function Header() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const { loggedIn } = useTwebContext();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 max-w-screen-2xl items-center justify-between gap-4">
        <div className="flex items-center justify-start md:gap-6 gap-2">
          {/* mobile menu */}
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger className="md:hidden block">
              <Menu className="h-6 w-6" />
            </SheetTrigger>
            <VisuallyHidden asChild>
              <SheetTitle>Mobile Menu</SheetTitle>
            </VisuallyHidden>

            <VisuallyHidden asChild>
              <SheetDescription>
                This is a menu for mobile
              </SheetDescription>
            </VisuallyHidden>
            <SheetContent side="left" className='flex flex-col'>
              <Link href={APP_HOMEPAGE_URL} className="flex items-center space-x-2" onClick={() => setMobileNavOpen(false)}>
                <Icons.logo className="w-20 px-2" />
              </Link>

              <Link
                href={APP_HOMEPAGE_URL}
                onClick={() => setMobileNavOpen(false)}
              >
                Explore
              </Link>

              <Link
                href={BOUNTY_CREATION_URL}
                onClick={() => setMobileNavOpen(false)}
              >
                Open a Bounty
              </Link>
              <Link
                href={CONSULTATION_CREATION_URL}
                onClick={() => setMobileNavOpen(false)}
              >
                Request for Consultation
              </Link>

              {/* TODO: only display this about juku route when user's not logged */}
              <a href={LANDING_PAGE_URL} rel="noreferrer noopener" target="_blank">
                About Juku
              </a>

              {
                loggedIn && (
                  <>
                    {/* TODO: TBD - where to link this route to? */}
                    <Link href={PLATFROM_QUEST_URL} onClick={() => setMobileNavOpen(false)}>
                      <Sprout className="h-6 w-6" />
                    </Link>

                    {/* TODO: display a list of menu to profile and settings */}
                    <Link href={PROFILE_URL} onClick={() => setMobileNavOpen(false)}>
                      <CircleUserRound className="h-6 w-6" />
                    </Link>

                    <Link href={PROFILE_SETTINGS_URL} onClick={() => setMobileNavOpen(false)}>
                      <Settings className="h-6 w-6" />
                    </Link>

                    <ConnectBtn />
                  </>
                )
              }

            </SheetContent>
          </Sheet>
          {/* end of mobile menu */}

          {/* desktop menu */}
          <Link href={APP_HOMEPAGE_URL} className="flex items-center space-x-2">
            <Icons.logo className="w-20 px-2" />
          </Link>

          <NavigationMenu className="md:block hidden">
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link href={APP_HOMEPAGE_URL} passHref legacyBehavior>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Explore
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Create Quest</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-3 md:w-[400px] lg:w-[500px]">
                    <Link href={BOUNTY_CREATION_URL} passHref legacyBehavior>
                      <ListItem title="Open a Bounty">
                        Raise a request in the public to get feedback from other contributors.
                      </ListItem>
                    </Link>
                    <Link href={CONSULTATION_CREATION_URL} passHref legacyBehavior>
                      <ListItem title="Request for Consultation">
                        Describe your consultation for experts to sign up and book a private session.
                      </ListItem>
                    </Link>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                {/* TODO: only display this about juku route when user's not logged - move this to profile icon after logged in*/}
                <Link href={LANDING_PAGE_URL} passHref legacyBehavior>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()} asChild>
                    <a rel="noreferrer noopener" target="_blank">
                      About Juku
                    </a>
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          {/* end of desktop menu */}
        </div>

        <div className="flex items-center justify-end gap-4">
          {
            loggedIn && (
              <>
                {/* TODO: TBD - where to link this route to? */}
                <Link href={PLATFROM_QUEST_URL} className="md:block hidden">
                  <Sprout className="h-6 w-6" />
                </Link>

                <NavigationMenu className="md:block hidden">
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger>
                        <CircleUserRound className="h-6 w-6" />
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid gap-3 p-3 w-[200px]">
                          <Link href={PROFILE_URL} passHref legacyBehavior>
                            <ListItem title="My Profile" />
                          </Link>
                          <Link href={PROFILE_SETTINGS_URL} passHref legacyBehavior>
                            <ListItem title="My Settings" />
                          </Link>
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>

                <Sheet>
                  <SheetTrigger>
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
              </>
            )
          }

          <div className={loggedIn ? "md:block hidden" : ""}>
            <ConnectBtn />
          </div>
        </div>
      </div>
    </header >
  )
}

const ListItem = forwardRef<
  ElementRef<"a">,
  ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"