import Link from 'next/link'
import { Icons } from '@/components/icons'
import { ConnectBtn } from '@/components/thirdweb/connect-btn'

export async function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Icons.logo className="h-6 w-6" />
          <span className="text-xl hidden font-bold sm:inline-block">
            [INSERT COMPANY NAME HERE]
          </span>
        </Link>

        <ConnectBtn />
      </div>
    </header>
  )
}
