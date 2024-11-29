import { useQuery, useQueryClient } from "@tanstack/react-query"
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
import { Account } from "thirdweb/wallets"

import { closeBounty } from "@/actions/bounty/closeBounty"
import { getProfile } from "@/actions/profile/getProfile"
import { Tag } from "@/actions/tag/type"
import BountyLikeButton from "@/components/bounty/like-button"
import BountyShareButton from "@/components/bounty/share-button"
import BountyStatusBadge from "@/components/bounty/status-badge"
import ContributionForm from "@/components/contribution/form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import UserAvatar from "@/components/user/avatar"
import { currentChain } from "@/const/chains"
import { tokenAddressToTokenNameMapping } from "@/const/contracts"
import { PROFILE_URL } from "@/const/links"
import { useViewerContext } from "@/contexts/viewer"
import { bountyClosedEventSignature, escrowContractInstance, fundClaimedEventSignature } from "@/lib/contract-instances"
import getURL from "@/lib/get-url";
import { client } from "@/lib/thirdweb-client"

export default function BountyCard({
  details,
  isClosingBounty,
  setIsClosingBounty,
  setShowAlertDialog,
  selectedContributions,
  bountyData,
  isBountyDataPending,
}: {
  details: any,
  isClosingBounty: boolean,
  setIsClosingBounty: (isClosingBounty: boolean) => void,
  setShowAlertDialog: (showAlertDialog: boolean) => void,
  selectedContributions: number[],
  bountyData: any,
  isBountyDataPending: boolean,
}) {
  const pathname = usePathname();
  const activeAccount = useActiveAccount();
  const { viewer } = useViewerContext();
  const queryClient = useQueryClient();
  const router = useRouter();

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

  const toggleWinnerSelection = () => {
    if (!pathname.includes("bounty")) {
      router.push(`/bounty/${details.id}?isClosingMode=true`)
    }
    setIsClosingBounty(!isClosingBounty)
  };

  const submitEndBounty = async () => {
    // console.log({ selectedContributions })
    if (bountyData && selectedContributions.length > bountyData[3]) {
      toast({ title: `You cannot select more than ${bountyData[3]} winners` })
      return;
    }

    if (!details.id || !activeAccount) {
      toast({ title: "Something went wrong" })
      console.error("Something went wrong", { details, activeAccount })
      return;
    }

    try {
      setShowAlertDialog(true);

      // submit the selected contributions to the escrow contract
      const contributorsAddresses = selectedContributions.map((id) => details.contributionMap[id]?.referee_id ? details.contributionMap[id]?.referee?.wallet_address : details.contributionMap[id]?.creator?.wallet_address);
      const referrersAddresses = selectedContributions.map((id) => details.contributionMap[id]?.referee_id ? details.contributionMap[id]?.creator?.wallet_address : constants.AddressZero);
      // console.log({ contributorsAddresses, referrersAddresses })
      // prepare `closeBounty` transaction
      const preparedClosingTx = prepareContractCall({
        contract: escrowContractInstance,
        method: "closeBounty",
        params: [details.bounty_id_on_escrow, contributorsAddresses, referrersAddresses],
      });
      // console.log({ preparedClosingTx })
      // prompt bounty creator to send `closeBounty` transaction
      const closingTxReceipt = await sendAndConfirmTransaction({
        transaction: preparedClosingTx,
        account: activeAccount,
      });
      // console.log({ closingTxReceipt })
      if (closingTxReceipt.status !== "success") {
        throw new Error("Fail to close bounty on smart contract");
      }

      const logs = closingTxReceipt.logs;

      const closingLog = logs.find(log => log.topics[0] === bountyClosedEventSignature);
      // console.log({ closingLog, logs })
      if (!closingLog) {
        throw new Error("Fail to get BountyClosed event log");
      }

      // TODO: IMPORTANT: If the bounty is closed unsuccessfully, the smart contract will not record the winning contributions.
      // submit the selected contributions to the backend
      await closeBounty({
        bountyId: details.id,
        winningContributions: selectedContributions,
      });

      // display the bounty closed toast
      toast({ title: "Closed bounty successfully" })
      setIsClosingBounty(false);
      // get latest bounty data to be displayed on the bounty card
      queryClient.invalidateQueries({ queryKey: ['fetchBounty', details.id] })
      // TODO: Refetch claimable funds so that the creator can claim refund if any - the invalidation below is not working
      queryClient.invalidateQueries({
        queryKey: [
          "readContract",
          currentChain.id,
          escrowContractInstance.address,
          "getClaimableFunds",
          JSON.stringify([details.bounty_id_on_escrow, viewer?.wallet_address || ""])
        ],
      });
    } catch (error) {
      console.error("Error closing bounty", error)
      toast({ title: "Fail to close bounty" })
    } finally {
      setShowAlertDialog(false);
    }
  }

  // Get bounty's reward details from escrow contract
  const { data: claimableFunds, isPending: isClaimableFundsPending } = useReadContract({
    contract: escrowContractInstance,
    method: "getClaimableFunds",
    params: [details.bounty_id_on_escrow, viewer?.wallet_address || ""]
  });

  const [isClaimedFund, setIsClaimedFund] = useState(false);

  const handleClaimFunds = async () => {
    if (!details.id || !activeAccount) {
      toast({ title: "Something went wrong" })
      console.error("Something went wrong", { details, activeAccount })
      return;
    }

    try {
      // prepare `claimFunds` transaction
      const preparedClaimTx = prepareContractCall({
        contract: escrowContractInstance,
        method: "claimFunds",
        params: [details.bounty_id_on_escrow],
      });
      // console.log({ preparedClaimTx })
      // prompt bounty creator to send `claimFunds` transaction
      const claimTxReceipt = await sendAndConfirmTransaction({
        transaction: preparedClaimTx,
        account: activeAccount as Account,
      });
      // console.log({ claimTxReceipt })
      if (claimTxReceipt.status !== "success") {
        throw new Error("Fail to claim funds on smart contract");
      }
      const logs = claimTxReceipt.logs;
      const claimLog = logs.find(log => log.topics[0] === fundClaimedEventSignature);
      // console.log({ claimLog, logs })
      if (!claimLog) {
        throw new Error("Fail to get FundClaimed event log");
      }
      toast({ title: "Claim funds successfully" })
      setIsClaimedFund(true);
    } catch (error) {
      console.error("Error claiming funds", error)
      toast({ title: "Fail to claim funds" })
    }
  }

  return (
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
            {
              !!(!isClaimableFundsPending && (claimableFunds && claimableFunds > 0)) &&
              <Button variant="default" onClick={handleClaimFunds} disabled={isClaimedFund}>
                {isClaimedFund ? 'Claimed' : (viewer?.id === details.creator_profile_id ? 'Claim Refund' : 'Claim Rewards')}
              </Button>
            }
          </div>
        </div>
      </CardFooter>}
    </Card>
  )
}