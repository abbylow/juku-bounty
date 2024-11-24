"use client"

import { useQuery } from "@tanstack/react-query"
import { formatDistance, formatDistanceToNow } from 'date-fns'
import { formatUnits } from "ethers/lib/utils"
import { Award, CalendarClock, Lightbulb, ChevronRight, Info } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from "react"
import { getContract } from "thirdweb"
import { decimals } from "thirdweb/extensions/erc20"
import { useActiveAccount, useReadContract } from "thirdweb/react"

import { createContribution } from "@/actions/contribution/createContribution"
import { getProfile } from "@/actions/profile/getProfile"
import { getProfiles } from "@/actions/profile/getProfiles"
import { Tag } from "@/actions/tag/type"
import BountyLikeButton from "@/components/bounty/like-button"
import BountyShareButton from "@/components/bounty/share-button"
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
import MultipleSelector, { Option } from '@/components/ui/multiple-selector'
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "@/components/ui/use-toast"
import UserAvatar from "@/components/user/avatar"
import { useViewerContext } from "@/contexts/viewer"
import { BountyStatus } from "@/const/bounty-status"
import { currentChain } from "@/const/chains"
import { tokenAddressToTokenNameMapping } from "@/const/contracts"
import { PROFILE_URL } from "@/const/links"
import { escrowContractInstance } from "@/lib/contract-instances"
import getURL from "@/lib/get-url";
import { client } from "@/lib/thirdweb-client"

export default function BountyCard({ details }: { details: any }) {
  const pathname = usePathname();
  const router = useRouter();
  const activeAccount = useActiveAccount();
  const { viewer } = useViewerContext();

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

  const [dialogOpen, setDialogOpen] = useState(false);

  const [contributionDescDisabled, setContributionDescDisabled] = useState(false);

  const [contributionDesc, setContributionDesc] = useState("");
  const handleDescChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContributionDesc(e.target.value)
  }

  const [referee, setReferee] = useState<Option[]>();

  useEffect(() => {
    if (referee?.length) {
      setContributionDescDisabled(true);
      setContributionDesc(`I refer ${referee[0].label} to contribute to this quest`);
    } else {
      setContributionDescDisabled(false);
    }
  }, [referee])


  const searchUsers = async (value: string): Promise<Option[]> => {
    const response = await getProfiles({
      username: value,
      display_name: value,
    });
    // TODO: remove viewer itself
    // TODO: for users that have disabled referral, user will not be able to choose and refer them and see the “Referral disabled” tag
    const options = response.map((profile) => ({
      value: profile.id,
      label: `${profile.display_name} @${profile.username}`, // Combine display name and username for the label
    }));
    return options;
  };

  const handleSubmission = async () => {
    try {
      await createContribution({
        bountyId: details.id,
        creatorProfileId: viewer?.id!,
        description: contributionDesc,
        referreeId: referee ? referee[0].value : ''
      })
      setDialogOpen(false);
      setContributionDesc("");
      setReferee([]);
      toast({ title: "Successfully created contribution." });
      router.push(`/bounty/${details.id}`)
    } catch (error) {
      console.log("Something went wrong")
    }
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
            <Badge variant="outline">{status}</Badge>
            {pathname.includes("bounty") ?
              <BountyShareButton bountyId={details.id} />
              : <Link href={getURL(`/bounty/${details?.id}`)}>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm font-medium">{details?.title}</div>
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
      </CardContent>
      {!!(activeAccount?.address) && <Separator className="mb-4" />}
      {!!(activeAccount?.address) && <CardFooter>
        <div className="w-full flex justify-between items-center">
          <div className="flex gap-3">
            <BountyLikeButton bountyId={details.id} />
          </div>
          {/* TODO: handle dynamic CTA - contribute / end quest / edit quest?  */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Lightbulb className="mr-2 h-5 w-5" /> Contribute
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:w-5/6">
              <DialogHeader>
                <DialogTitle>Contribute to Bounty</DialogTitle>
                <DialogDescription>
                  By submitting your response or refer a connection to contribute, a publicly visible thread will be opened among quester, you (and referrer) for any follow-up discussion.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="response" className="">
                    Enter your response or provide any relevant links
                  </Label>
                  <Textarea
                    id="response"
                    className="resize-y h-40"
                    value={contributionDesc}
                    onChange={handleDescChange}
                    disabled={contributionDescDisabled}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="referree" className="flex gap-1">
                    Refer user to contribute (optional)
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>You will earn 20% of the rewards if your referral wins the bounty rewards</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <MultipleSelector
                    value={referee}
                    onChange={setReferee}
                    maxSelected={1}
                    onMaxSelected={(maxLimit) => {
                      toast({ title: `You have reached max selected referee: ${maxLimit}` });
                    }}
                    onSearch={async (value) => {
                      return await searchUsers(value);
                    }}
                    placeholder="Search by display name or username"
                    loadingIndicator={
                      <p className="py-2 text-center text-lg leading-10 text-muted-foreground">loading...</p>
                    }
                    emptyIndicator={
                      <p className="w-full text-center text-lg leading-10 text-muted-foreground">
                        no user found.
                      </p>
                    }
                    hideClearAllButton
                  />
                </div>
              </div>
              <DialogFooter>
                <div className="flex flex-col gap-4">
                  <Button type="submit" onClick={handleSubmission}>Submit</Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardFooter>}
    </Card>
  )
}