"use client"

import { useQuery } from "@tanstack/react-query"
import { formatDistance, formatDistanceToNow } from 'date-fns'
import { formatUnits } from "ethers/lib/utils"
import { constants } from "ethers"
import { Award, CalendarClock, ChevronRight } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from "react"
import { getContract, prepareContractCall, sendAndConfirmTransaction } from "thirdweb"
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
import { toast } from "@/components/ui/use-toast"
import UserAvatar from "@/components/user/avatar"
import { currentChain } from "@/const/chains"
import { tokenAddressToTokenNameMapping } from "@/const/contracts"
import { PROFILE_URL } from "@/const/links"
import { useViewerContext } from "@/contexts/viewer"
import { bountyClosedEventSignature, escrowContractInstance } from "@/lib/contract-instances"
import getURL from "@/lib/get-url";
import { client } from "@/lib/thirdweb-client"

export default function BountyCard({ details, isClosingMode }: { details: any, isClosingMode?: boolean }) {
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
  const [isClosingBounty, setIsClosingBounty] = useState(!!isClosingMode);
  const toggleWinnerSelection = () => {
    if (!pathname.includes("bounty")) {
      router.push(`/bounty/${details.id}?isClosingMode=true`)
    }
    setIsClosingBounty(!isClosingBounty)
  };

  const [selectedContributions, setSelectedContributions] = useState<number[]>([]);

  const handleSelectWinner = (id: number, selected: boolean) => {
    setSelectedContributions((prev) =>
      selected ? [...prev, id] : prev.filter((contributionId) => contributionId !== id)
    );
  };

  const submitEndBounty = async () => {
    console.log({ selectedContributions })
    if (bountyData && selectedContributions.length > bountyData[3]) {
      toast({ title: `You cannot select more than ${bountyData[3]} winners` })
      return
    }

    if (!details.id || !activeAccount) {
      toast({ title: "Something went wrong" })
      console.error("Something went wrong", { details, activeAccount })
      return;
    }

    try {
      console.log( details.contributionMap[1] )
      const contributorsAddresses = selectedContributions.map((id) => details.contributionMap[id]?.referee_id ? details.contributionMap[id]?.referee?.wallet_address : details.contributionMap[id]?.creator?.wallet_address);
      const referrersAddresses = selectedContributions.map((id) => details.contributionMap[id]?.referee_id ? details.contributionMap[id]?.creator?.wallet_address : constants.AddressZero);
      console.log({ contributorsAddresses, referrersAddresses })
      // TODO: submit the selected contributions to the escrow contract
      // prepare `closeBounty` transaction
      const preparedClosingTx = prepareContractCall({
        contract: escrowContractInstance,
        method: "closeBounty",
        params: [details.bounty_id_on_escrow, contributorsAddresses, referrersAddresses],
      });
      console.log({ preparedClosingTx })
      // prompt bounty creator to send `closeBounty` transaction
      const closingTxReceipt = await sendAndConfirmTransaction({
        transaction: preparedClosingTx,
        account: activeAccount,
      });
      console.log({ closingTxReceipt })
      if (closingTxReceipt.status !== "success") {
        throw new Error("Fail to close bounty on smart contract");
      }

      const logs = closingTxReceipt.logs;

      const closingLog = logs.find(log => log.topics[0] === bountyClosedEventSignature);
      console.log({ closingLog, logs })
      if (!closingLog) {
        throw new Error("Fail to get BountyClosed event log");
      }

      // TODO: submit the selected contributions to the backend
      // TODO: display the bounty closed toast
      // toast({ title: "Closed bounty successfully" })
      // TODO: display winners on the bounty card

    } catch (error) {
      console.error("Error closing bounty", error)
      toast({ title: "Fail to close bounty" })
    }
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
      {details?.contributions?.length > 0 && (
        <>
          {isClosingBounty && (
            <div className="mt-8">
              <h3 className="text-xl font-bold">
                {`Select up to ${bountyData?.[3]} winner${bountyData && bountyData[3] > 1 ? '(s)' : ''} from existing contributor${details?.contributions?.length > 1 ? '(s)' : ''}:`}
              </h3>
            </div>
          )}
          <div className="mt-8">
            {details.contributions.map((contribution: Contribution) => (
              <ContributionCard
                key={contribution.id}
                contribution={contribution}
                isBountyResultDecided={details.is_result_decided}
                bountyCreatorId={details.creator_profile_id}
                isClosingBounty={isClosingBounty}
                onSelectWinner={handleSelectWinner}
                reachMaxNumberOfWinners={!!(bountyData && selectedContributions.length >= bountyData[3])}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}