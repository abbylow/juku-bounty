"use client"

import Link from "next/link";

import { BountyCreationForm } from "@/app/bounty/create/form";
import { useCeramicContext } from "@/components/ceramic/ceramic-provider";
import { ConnectBtn } from "@/components/thirdweb/connect-btn";
import { buttonVariants } from "@/components/ui/button";
import { PROFILE_SETTINGS_URL } from "@/const/links";
import { useTwebContext } from "@/contexts/thirdweb";

export default function BountyCreation() {
  const { viewerProfile } = useCeramicContext();
  const { loggedIn } = useTwebContext();

  if (!loggedIn) {
    return (
      <section>
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-xl font-medium">Oops! Login or sign up first to create your quest</h3>
            <ConnectBtn />
          </div>
        </div>
      </section>
    )
  }

  // prompt user to create profile first 
  if (viewerProfile === null) {
    return (
      <section>
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-xl font-medium">Oops! Set up your profile first to create your quest</h3>
            <Link href={PROFILE_SETTINGS_URL} className={buttonVariants({ variant: "outline" })}>
                Set up profile
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section>
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-xl font-medium">Open a Knowledge Bounty</h3>
          <p className="text-sm text-muted-foreground">
            Raise a request in the public to get feedback from other contributors
          </p>
        </div>
        <BountyCreationForm />
      </div>
    </section>
  )
}
