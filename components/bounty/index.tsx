"use client"

import { useQuery } from "@tanstack/react-query"
import { formatDistance, formatDistanceToNow } from 'date-fns'
import { formatUnits } from "ethers/lib/utils"
import debounce from "lodash.debounce"
import { Award, CalendarClock, Lightbulb, ChevronRight, Info } from "lucide-react"
import Link from "next/link"
import { usePathname } from 'next/navigation'
import { useEffect, useState } from "react"
import { getContract } from "thirdweb"
import { decimals } from "thirdweb/extensions/erc20"
import { useActiveAccount } from "thirdweb/react";

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
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import BountyLikeButton from "@/components/bounty/like-button"
import BountyShareButton from "@/components/bounty/share-button"
import UserAvatar from "@/components/user/avatar"
import { PROFILE_URL } from "@/const/links"
import getURL from "@/lib/get-url";
import { escrowContractInstance } from "@/lib/contract-instances"
import { useReadContract } from "thirdweb/react"
import { tokenAddressToTokenNameMapping } from "@/const/contracts"
import { client } from "@/lib/thirdweb-client"
import { BountyStatus } from "@/const/bounty-status"
import { currentChain } from "@/const/chains"
import { Select } from "@/components/ui/select"
import { getProfiles } from "@/actions/profile/getProfiles"
import MultipleSelector from "@/components/ui/multiple-selector"
import { Profile } from "@/actions/profile/type"

export default function BountyCard({ details }: { details: any }) {
  const pathname = usePathname();

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

  // Find user by display name or username
  const [searchTerm, setSearchTerm] = useState("");
  const [searchedProfiles, setSearchedProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  console.log({loading, searchTerm, searchedProfiles})

  // Debounced search function
  const fetchProfiles = debounce(async (query) => {
    // console.log('in fetchProfiles')
    if (!query) {
      console.log("empty query")
      setSearchedProfiles([]);
      return;
    }

    setLoading(true);
    try {
      const response = await getProfiles({
        username: query,
        display_name: query,
      });
      console.log({ response })
      setSearchedProfiles(response); // Expected to be an array of searchedProfiles
    } catch (error) {
      console.error("Error fetching searchedProfiles:", error);
    } finally {
      setLoading(false);
    }
  }, 300);
  // console.log({ searchTerm, searchedProfiles })

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    // console.log('in handleInputChange')
    setSearchTerm(value);
    fetchProfiles(value); // Trigger the debounced search
  };

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
          <Dialog>
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
                  <Input
                    id="referree"
                    placeholder="Search by display name or username"
                    value={searchTerm}
                    onChange={handleInputChange}
                    className="mb-2"
                  />
                  {/* {loading && <p>Loading...</p>} */}
                  {/* <Select id="referree-options" defaultValue="">
                    <option value="" disabled>
                      Select a user
                    </option>
                    {searchedProfiles.length > 0 ? (
                      searchedProfiles.map((profile) => (
                        <option key={profile.id} value={profile.id} disabled={profile.disabled}>
                          {profile.display_name} @{profile.username}{" "}
                          {profile.disabled && "(Referral disabled)"}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        No results found
                      </option>
                    )}
                  </Select> */}
                </div>
              </div>
              <DialogFooter>
                <div className="flex flex-col gap-4">
                  <Button type="submit">Submit</Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardFooter>}
    </Card>
  )
}