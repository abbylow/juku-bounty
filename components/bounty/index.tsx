"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { formatDistance, formatDistanceToNow } from 'date-fns'
import { formatUnits } from "ethers/lib/utils"
import { Award, CalendarClock, MessageSquare, ThumbsUp, Link as LinkIcon, Lightbulb } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getContract } from "thirdweb"
import { decimals } from "thirdweb/extensions/erc20"
import { useActiveAccount } from "thirdweb/react";

import { handleLikeDislike } from "@/actions/bountyLike/likeBounty"
import { getCurrentLikeStatus } from "@/actions/bountyLike/getBountyLike"
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import UserAvatar from "@/components/user/avatar"
import { PROFILE_URL } from "@/const/links"
import { useClipboard } from "@/hooks/useClipboard";
import getURL from "@/lib/get-url";
import { escrowContractInstance } from "@/lib/contract-instances"
import { useReadContract } from "thirdweb/react"
import { tokenAddressToTokenNameMapping } from "@/const/contracts"
import { client } from "@/lib/thirdweb-client"
import { currentChain } from "@/const/chains"

enum BountyStatus {
  OPEN = "Open",
  ENDED = "Ended",
  COMPLETED = "Completed",
  UNKNOWN = "Unknown"
}

// TODO: extract like button and logic to another component? 
export default function BountyCard({ details }: { details: any }) {
  // console.log({ details })
  const activeAccount = useActiveAccount();

  // Get bounty's reward details from escrow contract
  const { data: bountyData, isPending: isBountyDataPending } = useReadContract({
    contract: escrowContractInstance,
    method: "bounties",
    params: [details.bounty_id_on_escrow],
  });

  // Get bounty's status
  const [status, setStatus] = useState<BountyStatus>(BountyStatus.UNKNOWN);

  useEffect(() => {
    if (details && bountyData) {
      const isClosed = bountyData[7];
      const isExpired = details.expiry <= new Date();
      const hasWinner = details.winningContributions > 0;

      if (hasWinner) {
        setStatus(BountyStatus.COMPLETED);
      } else if (isExpired || isClosed) {
        setStatus(BountyStatus.ENDED);
      } else {
        setStatus(BountyStatus.OPEN);
      }
    }
  }, [details, bountyData])

  // Calculate total rewards of this bounty
  const [totalReward, setTotalReward] = useState<string>('');

  const calcTotalRewards = async () => {
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

    const totalRewardInDecimals = formatUnits((bountyData[2] * bountyData[3]).toString(), rewardTokenDecimals);
    // setTotalReward(Number.parseFloat(totalRewardInDecimals).toFixed(2))
    setTotalReward(totalRewardInDecimals);
  }

  useEffect(() => {
    if (!isBountyDataPending && bountyData) {
      calcTotalRewards()
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

  // Get current like 
  const queryClient = useQueryClient();

  const { data: isLiked } = useQuery({
    queryKey: ['fetchBountyLikeStatus', details.id, activeAccount?.address],
    queryFn: async () => await getCurrentLikeStatus({ bountyId: details.id }),
    enabled: !!(activeAccount?.address) // only get liked status if logged in
  })

  // Handle "like / dislike bounty" feature
  const toggleLike = async () => {
    await handleLikeDislike({
      bountyId: details.id,
      like: !isLiked
    })
    queryClient.invalidateQueries({ queryKey: ['fetchBountyLikeStatus'] })
  }

  // Handle "contribute" / "refer" feature
  const makeContribution = async () => {
    console.log('di dalam makeContribution')
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
            <Badge variant="outline">{status}</Badge>
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
          <div className="flex gap-3">
            {!!(activeAccount?.address) && <Button variant="ghost" size="icon" onClick={toggleLike}>
              {/* TODO: import color code from theme */}
              <ThumbsUp fill={isLiked ? "#0F172A" : "#FFFFFF"} className="h-5 w-5" />
            </Button>}
            <Button variant="ghost" size="icon" onClick={shareBounty}>
              <LinkIcon className="h-5 w-5" />
            </Button>
          </div>
          {/* TODO: handle dynamic CTA - contribute / end quest / edit quest?  */}
          {/* TODO: the form here is sample code only */}
          <div className="">
            {!!(activeAccount?.address) && <Dialog>
              <DialogTrigger asChild>
                <Button onClick={makeContribution}>
                  <Lightbulb className="mr-2 h-5 w-5" /> Contribute
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit profile</DialogTitle>
                  <DialogDescription>
                    Make changes to your profile here. Click save when you're done.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      defaultValue="Pedro Duarte"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="username" className="text-right">
                      Username
                    </Label>
                    <Input
                      id="username"
                      defaultValue="@peduarte"
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Save changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>}
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}