"use client";

import Link from "next/link";

import WalletAddress from "@/components/copyable-address/address";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button"
import { Option } from "@/components/ui/multiple-selector";
import UserAvatar from "@/components/user/avatar";
import { PROFILE_SETTINGS_URL } from "@/const/links";
import { IPlatform } from "@/components/ceramic/types";
import { Icons } from "@/components/icons";

interface IProfileCard {
  pfp: string;
  displayName: string;
  address: string;
  username: string;
  bio: string;
  categories?: Option[];
  integrations?: IPlatform[];
  allowEdit?: boolean;
}

const PLATFORM_BADGES = {
  "coinbase_verified_account": <Icons.coinbase className="h-6 w-6" />
}

export default function ProfileCard({
  pfp,
  displayName,
  address,
  username,
  bio,
  categories,
  integrations,
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
        <div className="flex gap-2">
          {integrations?.map(c => (PLATFORM_BADGES[c.name]))}
        </div>

      </div>
      {allowEdit && <Link href={PROFILE_SETTINGS_URL} className={buttonVariants({ variant: "outline" })}>
        Edit Profile
      </Link>}
    </div>
  )
}
