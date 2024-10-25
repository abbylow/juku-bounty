"use client";

import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";

import WalletAddress from "@/components/copyable-address/address";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button"
import { Option } from "@/components/ui/multiple-selector";
import UserAvatar from "@/components/user/avatar";
import { Icons } from "@/components/icons";
import { useCeramicContext } from "@/components/ceramic/ceramic-provider";
import { toast } from "@/components/ui/use-toast";
import { PROFILE_SETTINGS_URL } from "@/const/links";
import { VerifiedPlatform } from "@/actions/verifiedPlatform/type";

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
  const { composeClient, viewerProfile } = useCeramicContext();

  const [following, setFollowing] = useState<boolean>(false);
  const [existingRelation, setExistingRelation] = useState<string>("");

  const getFollowStatus = async () => {
    // TODO: filter by "active"
    const followRecord = await composeClient.executeQuery(`
      query {
        viewer {
          followList(
            first: 1
            filters: {
              where: {
                followeeId: {
                  equalTo: "${id}"
                }, 
                followerId: {
                  equalTo: "${viewerProfile?.id}"
                }
              }
            }
          ) {
            edges {
              node {
                active
                followerId
                followeeId
                id
              }
            }
          }
        }
      }
    `)
    console.log("components/profile/card ", { followRecord })
    if (followRecord?.data?.viewer?.followList?.edges?.length) {
      // has existing follow record, check if it's active
      setFollowing(followRecord.data.viewer.followList.edges[0]?.node?.active)
      setExistingRelation(followRecord.data.viewer.followList.edges[0]?.node?.id)
    } else {
      setFollowing(false)
      setExistingRelation("")
    }
  }

  useEffect(() => {
    if (allowFollow && id && viewerProfile?.id) {
      // find if the viewer has followed this profile 
      getFollowStatus()
    }
  }, [id, viewerProfile])

  const followUser = () => updateFollowRelation(true)
  const unfollowUser = () => updateFollowRelation(false)

  const updateFollowRelation = async (shouldFollow: boolean) => {
    console.log('handle follow user')
    if (existingRelation) {
      // update follow relationship to shouldFollow 
      const update = await composeClient.executeQuery(`
        mutation {
          updateFollow(
            input: {
              id: "${existingRelation}", 
              content: {
                active: ${shouldFollow}, 
                editedAt: "${new Date().toISOString()}"
              }
            }
          ) {
            document {
              active
              followeeId
              followerId
              id
            }
          }
        }
      `)
      console.log("components/profile/card ", { update })
      if (update.errors) {
        toast({ title: `Something went wrong: ${update.errors}` })
      } else {
        toast({ title: shouldFollow ? "Followed this user" : "Unfollowed this user" })
        setFollowing(update?.data?.updateFollow?.document?.active);
      }
    } else {
      // create new follow relationship
      // TODO: set context according to the environment
      const creation = await composeClient.executeQuery(`
        mutation {
          createFollow(
            input: {
              content: {
                active: ${shouldFollow}, 
                followeeId: "${id}",
                followerId: "${viewerProfile?.id}",
                createdAt: "${new Date().toISOString()}",
                editedAt: "${new Date().toISOString()}"
              }
            }
          ) {
            document {
              active
              createdAt
              editedAt
              followeeId
              followerId
              id
            }
          }
        }

      `)
      console.log("components/profile/card ", { creation })

      if (creation.errors) {
        toast({ title: `Something went wrong: ${creation.errors}` })
      } else {
        toast({ title: shouldFollow ? "Followed this user" : "Unfollowed this user" })
        setFollowing(creation?.data?.createFollow?.document?.active);
        setExistingRelation(creation?.data?.createFollow?.document?.id);
      }
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
      {allowFollow && !following && (<Button onClick={followUser}>
        Follow
      </Button>)}
      {allowFollow && following && (<Button onClick={unfollowUser}>
        Unfollow
      </Button>)}
      {allowEdit && (<Link href={PROFILE_SETTINGS_URL} className={buttonVariants({ variant: "outline" })}>
        Edit Profile
      </Link>)}
    </div>
  )
}
