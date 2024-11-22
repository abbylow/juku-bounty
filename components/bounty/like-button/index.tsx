"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { ThumbsUp } from "lucide-react"
import { useActiveAccount } from "thirdweb/react"

import { handleLikeDislike } from "@/actions/bountyLike/likeBounty"
import { getCurrentLikeStatus } from "@/actions/bountyLike/getBountyLike"
import { Button } from "@/components/ui/button"
import { empty, filled } from "@/const/color"

export default function BountyLikeButton({ bountyId }: { bountyId: string }) {
  const queryClient = useQueryClient();
  const activeAccount = useActiveAccount();

  const { data: isLiked } = useQuery({
    queryKey: ['fetchBountyLikeStatus', bountyId, activeAccount?.address],
    queryFn: async () => await getCurrentLikeStatus({ bountyId: bountyId }),
    enabled: !!(activeAccount?.address) // only get liked status if logged in
  })

  const toggleLike = async () => {
    await handleLikeDislike({
      bountyId,
      like: !isLiked
    })
    queryClient.invalidateQueries({ queryKey: ['fetchBountyLikeStatus'] })
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggleLike}>
      <ThumbsUp fill={isLiked ? filled : empty} className="h-5 w-5" />
    </Button>
  )
}