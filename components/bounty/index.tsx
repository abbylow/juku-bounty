"use client"

import { useQuery } from "@tanstack/react-query"
import { formatDistance, formatDistanceToNow } from 'date-fns'
import { Award, CalendarClock, MessageSquare, ThumbsUp, Share, Lightbulb } from "lucide-react"
import Link from "next/link"

import { getProfile } from "@/actions/profile/getProfile"
import { Tag } from "@/actions/tag/type"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import UserAvatar from "@/components/user/avatar"
import { PROFILE_URL } from "@/const/links"
import { useClipboard } from "@/hooks/useClipboard";
import getURL from "@/lib/get-url";
import { escrowContractInstance } from "@/lib/contract-instances"
import { useReadContract } from "thirdweb/react"
import { tokenAddressToTokenNameMapping } from "@/const/contracts"
import { getContract } from "thirdweb"
import { client } from "@/lib/thirdweb-client"
import { currentChain } from "@/const/chains"
import { decimals } from "thirdweb/extensions/erc20"
import { useEffect, useState } from "react"
import { formatUnits } from "ethers/lib/utils"

export default function BountyCard({ details }: { details: any }) {
  console.log({ details })

  // Get bounty's reward details from escrow contract
  const { data: bountyData, isPending: isBountyDataPending } = useReadContract({
    contract: escrowContractInstance,
    method: "bounties",
    params: [details.bounty_id_on_escrow],
  });

  console.log({ bountyData, isBountyDataPending })

  const [totalReward, setTotalReward] = useState<string>('');

  const getRewardTokenDecimals = async () => {
    if (!bountyData) {
      return 0
    }

    // Get reward token contract
    const rewardTokenInstance = getContract({
      client: client,
      chain: currentChain,
      address: bountyData?.[1] || "",
    });

    // get the decimals of the reward token 
    const rewardTokenDecimals = await decimals({
      contract: rewardTokenInstance
    })

    console.log({ rewardTokenDecimals })

    const totalRewardInDecimals = formatUnits((bountyData[2] * bountyData[3]).toString(), rewardTokenDecimals);
    // setTotalReward(Number.parseFloat(totalRewardInDecimals).toFixed(2))
    setTotalReward(totalRewardInDecimals);
  }

  useEffect(() => {
    if (!isBountyDataPending && bountyData) {
      getRewardTokenDecimals()
    }
  }, [isBountyDataPending, bountyData]);

  // Fetch bounty's creator
  const { data: creatorProfile, isPending: isCreatorProfilePending } = useQuery({
    queryKey: ['fetchCreatorProfile', details.creator_profile_id],
    queryFn: async () => await fetchCreatorProfile(details.creator_profile_id),
  })
  async function fetchCreatorProfile(profileId: string) {
    const profile = await getProfile({
      id: profileId
    });
    return profile
  };

  // Handle "share this bounty" feature
  const { copy } = useClipboard({ timeout: 1000 });
  const shareBounty = () => {
    const bountyUrl = getURL(`/bounty/${details?.id}`);
    copy(bountyUrl, "Successfully copied bounty link.");
  }

  if (isCreatorProfilePending || isBountyDataPending) {
    return <Skeleton className="h-56" />
  }

  if (!details || !(details.id)) {
    return <div>Bounty not found!</div>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between flex-wrap gap-2">
          <Link href={`${PROFILE_URL}/${creatorProfile?.username}`} className="flex items-center space-x-4">
            <UserAvatar pfp={creatorProfile?.pfp} />
            <div>
              <p className="text-sm font-medium leading-none">{creatorProfile?.display_name || ''}</p>
              <p className="text-sm text-muted-foreground">{`@${creatorProfile?.username || ''}`}</p>
            </div>
          </Link>

          <div className="flex gap-3 items-center flex-wrap">
            <div className="text-xs text-muted-foreground">
              {`Created ${formatDistance(details?.created_at, new Date(), { addSuffix: true })}`}
            </div>
            {/* TODO: get status from query data */}
            {/* TODO: assign different colors to different statuses */}
            <Badge>Open</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm font-medium">{details?.title}</div>
        {/* TODO: when the description is too long -> line-clamp-10 and view more */}
        <div className="text-sm text-muted-foreground whitespace-pre-wrap">
          {details?.description}
        </div>
        <div className="flex gap-4 flex-wrap">
          <div className="flex gap-2">
            <Award className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {totalReward} {tokenAddressToTokenNameMapping[bountyData?.[1] || '']} {bountyData && bountyData[3] > 1 ? ` for ${bountyData?.[3]} persons` : ""}
            </p>
          </div>
          <div className="flex gap-2">
            <CalendarClock className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {`Due ${formatDistanceToNow(details?.expiry, { addSuffix: true })}`}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {details.tags.map((tag: Tag) => (<Badge key={tag.id} variant="outline">{tag.name}</Badge>))}
        </div>
        <Separator />
      </CardContent>
      <CardFooter>
        <div className="w-full flex justify-between items-center">
          {/* TODO: handle reactions */}
          <div className="flex gap-3">
            <Button variant="ghost" size="icon">
              <ThumbsUp className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <MessageSquare className="h-5 w-5" />
            </Button>
            {/* <Button variant="ghost" size="icon">
                <Lightbulb className="h-5 w-5" />
              </Button> */}
            <Button variant="ghost" size="icon" onClick={shareBounty}>
              <Share className="h-5 w-5" />
            </Button>
          </div>
          {/* TODO: handle dynamic CTA */}
          {/* <div className="">
            <Button>
              <Lightbulb className="mr-2 h-5 w-5" /> Contribute
            </Button>
          </div> */}
        </div>
      </CardFooter>
    </Card>
  )
}