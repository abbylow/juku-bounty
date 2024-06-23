import { Linkedin, Twitter } from 'lucide-react'
import { JukuIcon } from '@/components/juku/icon'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { CONTACT_US_URL, FAQ_URL, HOW_IT_WORKS_URL, INTRODUCTION_URL, LANDING_PAGE_URL, LINKEDIN_URL, TERMS_OF_SERVICE_URL, TWITTER_URL } from '@/const/links'

export function Footer() {
  return (
    <footer className="py-6 bg-secondary">
      <div className="container max-w-screen-2xl flex md:flex-row md:items-center md:justify-between flex-col gap-16">
        <div className="flex md:items-center gap-8">
          <div className="flex flex-col gap-4">
            <a href={LANDING_PAGE_URL} rel="noreferrer noopener" target="_blank">
              <JukuIcon className="w-40" />
            </a>
            <div className='flex gap-4'>
              <a href={LINKEDIN_URL} rel="noreferrer noopener" target="_blank">
                <Linkedin className="h-6 w-6" />
              </a>
              <a href={TWITTER_URL} rel="noreferrer noopener" target="_blank">
                <Twitter className="h-6 w-6" />
              </a>
            </div>
            <p className="text-balance text-center leading-loose text-muted-foreground md:text-left">
              © COPYRIGHT 2024 Juku
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 grid-cols-2 md:gap-24 gap-8">
          <div className="flex flex-col gap-2">
            <h5 className="text-lg font-semibold">
              Learn
            </h5>
            <a href={INTRODUCTION_URL} rel="noreferrer noopener" target="_blank" className="transition-colors text-foreground/60 hover:text-foreground/80">
              Introduction
            </a>
            <a href={HOW_IT_WORKS_URL} rel="noreferrer noopener" target="_blank" className="transition-colors text-foreground/60 hover:text-foreground/80">
              How it Works
            </a>
            <a href={CONTACT_US_URL} rel="noreferrer noopener" target="_blank" className="transition-colors text-foreground/60 hover:text-foreground/80">
              Talk to us
            </a>
          </div>

          <div className="flex flex-col gap-2">
            <h5 className="text-lg font-semibold">
              Company
            </h5>
            <a href={FAQ_URL} rel="noreferrer noopener" target="_blank" className="transition-colors text-foreground/60 hover:text-foreground/80">
              FAQ
            </a>
            <a href={TERMS_OF_SERVICE_URL} rel="noreferrer noopener" target="_blank" className="transition-colors text-foreground/60 hover:text-foreground/80">
              Terms of Service
            </a>
          </div>

          <ThemeToggle />
        </div>
      </div>
    </footer>
  )
}
