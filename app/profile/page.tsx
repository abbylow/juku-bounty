"use client";

import { useActiveAccount } from "thirdweb/react";

import { useCeramicContext } from "@/components/ceramic/ceramic-provider";
import ProfileCard from "@/components/profile/card";

export default function Profile() {
  const { viewerProfile } = useCeramicContext();

  const activeAccount = useActiveAccount();

  return (
    <div className="space-y-6 md:px-10 py-10 pb-16">
      <section className="">
        <ProfileCard
          pfp={viewerProfile?.pfp || ''}
          displayName={viewerProfile?.displayName || ''}
          address={activeAccount?.address || ''}
          username={viewerProfile?.username || ''}
          bio={viewerProfile?.bio || ''}
          categories={viewerProfile?.categories || []}
          integrations={viewerProfile?.integrations || []}
          allowEdit={true}
        />
      </section>
    </div >
  )
}
