"use client";

import Link from "next/link";
import { useActiveAccount } from "thirdweb/react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button"
import UserAvatar from "@/components/user/avatar";
import { useCeramicContext } from "@/components/ceramic/ceramic-provider";
import WalletAddress from "@/components/copyable-address/address";
import { PROFILE_SETTINGS_URL } from "@/const/links";

// TODO: show verification here
export default function Profile() {
  const { viewerProfile } = useCeramicContext();

  const activeAccount = useActiveAccount();

  return (
    <div className="space-y-6 md:px-10 py-10 pb-16">
      <section className="">
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-8 lg:space-y-0">
          <div className="flex flex-col gap-4 items-start">
            <UserAvatar
              pfp={viewerProfile?.pfp || ''}
              className="w-24 h-24"
            />
          </div>

          <div className="flex-1 space-y-4">
            <div className="flex flex-col gap-2">
              <p className="text-lg font-medium leading-none">
                {viewerProfile?.displayName}
              </p>
              <WalletAddress
                className="text-md font-medium"
                address={activeAccount?.address || ''}
              />
              <p className="text-sm text-muted-foreground">
                @{viewerProfile?.username}
              </p>
            </div>
            <p className="text-sm">
              {viewerProfile?.bio}
            </p>
            <div className="flex gap-2">
              {
                viewerProfile?.categories?.map(c => (
                  <Badge key={c.value}>
                    {c.label}
                  </Badge>
                ))
              }
            </div>
          </div>
          <Link href={PROFILE_SETTINGS_URL} className={buttonVariants({ variant: "outline" })}>
            Edit Profile
          </Link>
        </div>
      </section>
    </div >
  )
}
