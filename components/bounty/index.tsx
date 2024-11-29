"use client"

import { useState } from "react"
import { useReadContract } from "thirdweb/react"

import { BountyWinningContribution, Contribution } from "@/actions/bounty/type"
import BountyAlertDialog from "@/components/bounty/alert-dialog"
import BountyCard from "@/components/bounty/card"
import { ContributionCard } from "@/components/contribution/card"
import { Skeleton } from "@/components/ui/skeleton"
import { escrowContractInstance } from "@/lib/contract-instances"

export default function BountyPage({ details, isClosingMode }: { details: any, isClosingMode?: boolean }) {
  // Get bounty's reward details from escrow contract
  const { data: bountyData, isPending: isBountyDataPending } = useReadContract({
    contract: escrowContractInstance,
    method: "bounties",
    params: [details.bounty_id_on_escrow],
  });

  // Handle closing bounty
  const [isClosingBounty, setIsClosingBounty] = useState(!!isClosingMode);
  const [showAlertDialog, setShowAlertDialog] = useState(false);

  // Handle selecting winners
  const [selectedContributions, setSelectedContributions] = useState<number[]>([]);
  const handleSelectWinner = (id: number, selected: boolean) => {
    setSelectedContributions((prev) =>
      selected ? [...prev, id] : prev.filter((contributionId) => contributionId !== id)
    );
  };

  if (isBountyDataPending) {
    return <Skeleton className="h-56" />
  }

  if (!details || !(details.id)) {
    return <div>Bounty not found!</div>
  }

  return (
    <div>
      <BountyCard
        details={details}
        isClosingBounty={isClosingBounty}
        setIsClosingBounty={setIsClosingBounty}
        setShowAlertDialog={setShowAlertDialog}
        selectedContributions={selectedContributions}
        bountyData={bountyData}
        isBountyDataPending={isBountyDataPending}
      />
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
                isWinner={details.winningContributions.find((winningContribution: BountyWinningContribution) => winningContribution.contribution_id === contribution.id)}
              />
            ))}
          </div>
        </>
      )}
      <BountyAlertDialog open={showAlertDialog} setOpen={setShowAlertDialog} />
    </div>
  )
}