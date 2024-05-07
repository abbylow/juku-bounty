"use client"

import { useUser } from "@thirdweb-dev/react";
import { BountyForm } from "@/app/bounty/create/form";
import { ConnectBtn } from "@/components/thirdweb/connect-btn";

export default function BountyCreation() {
  const { isLoggedIn, isLoading } = useUser()

  if (!isLoading && !isLoggedIn) {
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

  return (
    <section>
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-xl font-medium">Open a Knowledge Bounty</h3>
          <p className="text-sm text-muted-foreground">
            Raise a request in the public to get feedback from other contributors
          </p>
        </div>
        <BountyForm />
      </div>
    </section>
  )
}
