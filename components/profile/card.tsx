"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { ReactNode, useState } from "react";

import WalletAddress from "@/components/copyable-address/address";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button"
import { Option } from "@/components/ui/multiple-selector";
import UserAvatar from "@/components/user/avatar";
import { Icons } from "@/components/icons";
import { toast } from "@/components/ui/use-toast";
import { PROFILE_SETTINGS_URL } from "@/const/links";
import { useViewerContext } from "@/contexts/viewer";
import { VerifiedPlatform } from "@/actions/verifiedPlatform/type";
import { getFollow } from "@/actions/follow/getFollow";
import { upsertFollow } from "@/actions/follow/upsertFollow";

interface IProfileCard {
  id: string;
  pfp: string;
  displayName: string;
  address: string;
  username: string;
  bio: string;
  categories?: Option[];
  integrations?: VerifiedPlatform[];
  allowEdit?: boolean;
  allowFollow?: boolean;
}

const PLATFORM_BADGES: Record<string, ReactNode> = {
  "coinbase_verified_account": <Icons.coinbase key={"coinbase_verified_account"} className="h-6 w-6" />
}

export default function ProfileCard({
  id,
  pfp,
  displayName,
  address,
  username,
  bio,
  categories,
  integrations,
  allowEdit = false,
  allowFollow = false
}: IProfileCard) {
  const { viewer } = useViewerContext();
  const queryClient = useQueryClient();

  const { data: following, isPending: isFollowingPending } = useQuery({
    queryKey: ['fetchCurrentFollowStatus', viewer?.id, id],
    queryFn: async () => await getFollow({ followerId: viewer?.id!, followeeId: id }),
    enabled: !!(viewer?.id) && allowFollow
  })

  const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);
  
  const updateFollowRelation = async () => {
    if (!viewer) {
      toast({ title: 'Something went wrong: Unable to get viewer' })
      return;
    }
    try {
      setIsUpdatingFollow(true);
      const result = await upsertFollow({
        followeeId: id,
        followerId: viewer?.id,
        active: !following?.active
      })

      if (!result) {
        toast({ title: `Something went wrong` })
      }
      queryClient.invalidateQueries({ queryKey: ['fetchCurrentFollowStatus'] })
    } catch (error) {
      console.log({ error })
      toast({ title: `Something went wrong: ${error}` })
    } finally {
      setIsUpdatingFollow(false);
    }
  }

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
          {integrations?.filter(el => el.verified).map(c => (PLATFORM_BADGES[c.type]))}
        </div>

      </div>
      {allowFollow && (
        <Button onClick={updateFollowRelation} disabled={isFollowingPending || isUpdatingFollow} variant={following?.active ? "outline" : "default"}>
          {(isFollowingPending || isUpdatingFollow)&& <Loader2 className="animate-spin mr-2" />}
          {following?.active ? "Unfollow" : "Follow"}
        </Button>
      )}
      {allowEdit && (<Link href={PROFILE_SETTINGS_URL} className={buttonVariants({ variant: "outline" })}>
        Edit Profile
      </Link>)}
    </div>
  )
}
