"use client";

import Link from "next/link";
import { useActiveAccount } from "thirdweb/react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button"
import UserAvatar from "@/components/user/avatar";
import WalletAddress from "@/components/copyable-address/address";
import { PROFILE_SETTINGS_URL } from "@/const/links";
import { Option } from "@/components/ui/multiple-selector";

interface IProfileCard {
  pfp: string;
  displayName: string;
  address: string;
  username: string;
  bio: string;
  categories: Option[];
  allowEdit: boolean;
}

export default function ProfileCard({
  pfp,
  displayName,
  address,
  username,
  bio,
  categories,
  allowEdit = false
}: IProfileCard) {
  return (
    <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-8 lg:space-y-0">
      <div className="flex flex-col gap-4 items-start">
        <UserAvatar
          pfp={pfp}
          className="w-24 h-24"
        />
      </div>

      <div className="flex-1 space-y-4">
        <div className="flex flex-col gap-2">
          <p className="text-lg font-medium leading-none">
            {displayName}
          </p>
          <WalletAddress
            className="text-md font-medium"
            address={address}
          />
          <p className="text-sm text-muted-foreground">
            @{username}
          </p>
        </div>
        <p className="text-sm">
          {bio}
        </p>
        <div className="flex gap-2">
          {
            categories?.map(c => (
              <Badge key={c.value}>
                {c.label}
              </Badge>
            ))
          }
        </div>
      </div>
      {allowEdit && <Link href={PROFILE_SETTINGS_URL} className={buttonVariants({ variant: "outline" })}>
        Edit Profile
      </Link>}
    </div>
  )
}
