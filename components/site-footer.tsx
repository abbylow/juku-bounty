import { Linkedin } from 'lucide-react'
import Image from "next/image";
import { CONTACT_US_URL, HOW_IT_WORKS_URL, INTRODUCTION_URL, LANDING_PAGE_URL, LINKEDIN_URL, TERMS_OF_SERVICE_URL, TWITTER_URL } from '@/const/links'
import { Icons } from '@/components/icons'

export function Footer() {
  return (
    <footer className="py-6 bg-primary">
      <div className="container max-w-screen-2xl flex md:flex-row md:items-center md:justify-between flex-col gap-16">
        <div className="flex md:items-center gap-8">
          <div className="flex flex-col gap-4">
            <a href={LANDING_PAGE_URL} rel="noreferrer noopener" target="_blank">
              <Icons.logo className="w-40" />
            </a>
            <div className='flex gap-4'>
              <a href={LINKEDIN_URL} rel="noreferrer noopener" target="_blank">
                <Icons.linkedIn className="h-6 w-6" />
              </a>
              <a href={TWITTER_URL} rel="noreferrer noopener" target="_blank">
                {/* TODO: update this twitter logo to svg*/}
                {/* <Twitter className="h-6 w-6" /> */}
                {/* <Icons.twitter className="h-6 w-6" /> */}
                <Image
                  src="/twitter.png"
                  alt="X (formerly Twitter)"
                  width={24}
                  height={24}
                />
              </a>
            </div>
            <p className="text-balance font-semibold text-center leading-loose md:text-left">
              © COPYRIGHT 2024 Juku
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 grid-cols-2 md:gap-24 gap-8">
          <div className="flex flex-col gap-4">
            <h5 className="text-xl font-bold">
              Learn
            </h5>
            <a href={INTRODUCTION_URL} rel="noreferrer noopener" target="_blank" className="font-semibold hover:underline hover:underline-offset-8 hover:decoration-2 hover:decoration-secondary">
              Introduction
            </a>
            <a href={HOW_IT_WORKS_URL} rel="noreferrer noopener" target="_blank" className="font-semibold hover:underline hover:underline-offset-8 hover:decoration-2 hover:decoration-secondary">
              How it Works
            </a>
            <a href={CONTACT_US_URL} rel="noreferrer noopener" target="_blank" className="font-semibold hover:underline hover:underline-offset-8 hover:decoration-2 hover:decoration-secondary">
              Talk to us
            </a>
          </div>

          <div className="flex flex-col gap-2">
            <h5 className="text-xl font-bold">
              Company
            </h5>
            <a href={TERMS_OF_SERVICE_URL} rel="noreferrer noopener" target="_blank" className="font-semibold hover:underline hover:underline-offset-8 hover:decoration-2 hover:decoration-secondary">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
