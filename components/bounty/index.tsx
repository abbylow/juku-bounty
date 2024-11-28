"use client"

import { useQuery } from "@tanstack/react-query"
import { formatDistance, formatDistanceToNow } from 'date-fns'
import { formatUnits } from "ethers/lib/utils"
import { Award, CalendarClock, ChevronRight } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from "react"
import { getContract } from "thirdweb"
import { decimals } from "thirdweb/extensions/erc20"
import { useActiveAccount, useReadContract } from "thirdweb/react"

import { Contribution } from "@/actions/bounty/type"
import { getProfile } from "@/actions/profile/getProfile"
import { Tag } from "@/actions/tag/type"
import BountyLikeButton from "@/components/bounty/like-button"
import BountyShareButton from "@/components/bounty/share-button"
import BountyStatusBadge from "@/components/bounty/status-badge"
import { ContributionCard } from "@/components/contribution/card"
import ContributionForm from "@/components/contribution/form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import UserAvatar from "@/components/user/avatar"
import { currentChain } from "@/const/chains"
import { tokenAddressToTokenNameMapping } from "@/const/contracts"
import { PROFILE_URL } from "@/const/links"
import { useViewerContext } from "@/contexts/viewer"
import { escrowContractInstance } from "@/lib/contract-instances"
import getURL from "@/lib/get-url";
import { client } from "@/lib/thirdweb-client"

export default function BountyCard({ details }: { details: any }) {
  const pathname = usePathname();
  const activeAccount = useActiveAccount();
  const { viewer } = useViewerContext();
  const router = useRouter();

  // Get bounty's reward details from escrow contract
  const { data: bountyData, isPending: isBountyDataPending } = useReadContract({
    contract: escrowContractInstance,
    method: "bounties",
    params: [details.bounty_id_on_escrow],
  });

  // Calculate total rewards of this bounty
  const [totalReward, setTotalReward] = useState<string>('');

  const calcTotalRewards = useCallback(async () => {
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
  }, [bountyData]);

  useEffect(() => {
    if (!isBountyDataPending && bountyData) {
      calcTotalRewards()
    }
  }, [isBountyDataPending, bountyData, calcTotalRewards]);

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

  // Handle closing bounty
  const [isClosingBounty, setIsClosingBounty] = useState(false);
  const toggleWinnerSelection = () => {
    if (!pathname.includes("bounty")) {
      router.push(`/bounty/${details.id}`)
    }
    setIsClosingBounty(!isClosingBounty)
  };

  const [selectedContributions, setSelectedContributions] = useState<number[]>([]);
  // console.log({ isClosingBounty, selectedContributions })
  const handleSelectWinner = (id: number, selected: boolean) => {
    setSelectedContributions((prev) =>
      selected ? [...prev, id] : prev.filter((contributionId) => contributionId !== id)
    );
  };

  const submitEndBounty = () => {
    console.log({ selectedContributions })
  }

  if (isCreatorProfilePending || isBountyDataPending) {
    return <Skeleton className="h-56" />
  }

  if (!details || !(details.id)) {
    return <div>Bounty not found!</div>
  }

  return (
    <div>
      <Card className="mb-4">
        <CardHeader>
          <div className="flex justify-between flex-wrap gap-2">
            <div className="flex items-center space-x-4">
              <UserAvatar pfp={creatorProfile?.pfp} />
              <div>
                <p className="text-sm font-medium leading-none">{creatorProfile?.display_name || ''}</p>
                <Link href={`${PROFILE_URL}/${creatorProfile?.username}`}>
                  <p className="text-sm text-muted-foreground">{`@${creatorProfile?.username || ''}`}</p>
                </Link>
              </div>
            </div>

            <div className="flex gap-3 items-center flex-wrap">
              <div className="text-xs text-muted-foreground">
                {`Created ${formatDistance(details?.created_at, new Date(), { addSuffix: true })}`}
              </div>
              <BountyStatusBadge details={details} bountyData={bountyData} />
              {pathname.includes("bounty") ?
                <BountyShareButton bountyId={details.id} />
                : <Link href={getURL(`/bounty/${details?.id}`)}>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <h2 className="text-2xl font-bold">{details?.title}</h2>
          <p className="text-sm whitespace-pre-wrap">
            {details?.description}
          </p>
          <div className="flex gap-4 flex-wrap">
            <div className="flex gap-2">
              <Award className="h-5 w-5" />
              <p className="text-sm">
                {totalReward} {tokenAddressToTokenNameMapping[bountyData?.[1] || '']} {bountyData && bountyData[3] > 1 ? ` for ${bountyData?.[3]} persons` : ""}
              </p>
            </div>
            <div className="flex gap-2">
              <CalendarClock className="h-5 w-5" />
              <p className="text-sm">
                {`Due ${formatDistanceToNow(details?.expiry, { addSuffix: true })}`}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {details.tags.map((tag: Tag) => (<Badge key={tag.id} variant="outline">{tag.name}</Badge>))}
          </div>
        </CardContent>
        {!!(activeAccount?.address) && <CardFooter className="flex justify-between">
          <div className="w-full flex justify-between items-center flex-wrap gap-2">
            <div className="flex gap-3">
              <BountyLikeButton bountyId={details.id} />
            </div>
            <div className="flex gap-3">
              {
                (viewer?.id === details.creator_profile_id && !details.is_result_decided) &&
                <Button
                  variant={isClosingBounty ? "secondary" : "default"}
                  onClick={toggleWinnerSelection}
                >
                  {isClosingBounty ? 'Cancel' : 'End bounty'}
                </Button>
              }
              {
                (viewer?.id === details.creator_profile_id && !details.is_result_decided) && isClosingBounty &&
                <Button variant="default" onClick={submitEndBounty}>Submit</Button>
              }
              {
                (viewer?.id !== details.creator_profile_id && !details.is_result_decided) &&
                <ContributionForm bountyId={details.id} />
              }
              {/* {
                (details.is_result_decided) &&
                <Button variant="default">Get rewards</Button>
              } */}
            </div>
          </div>
        </CardFooter>}
      </Card>
      {/* TODO: sort the contributions by created_at DESC */}
      {details?.contributions?.length > 0 && <div className="mt-8">
        {details.contributions.map((contribution: Contribution) => (
          <ContributionCard
            key={contribution.id}
            contribution={contribution}
            isBountyResultDecided={details.is_result_decided}
            bountyCreatorId={details.creator_profile_id}
            isClosingBounty={isClosingBounty}
            onSelectWinner={handleSelectWinner}
          />
        ))}
      </div>}
    </div>
  )
}