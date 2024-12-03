"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { useActiveAccount } from "thirdweb/react";

import { handleLikeDislike } from "@/actions/bountyLike/likeBounty";
import { getCurrentLikeStatus } from "@/actions/bountyLike/getBountyLike";
import { Button } from "@/components/ui/button";
import { empty, filled } from "@/const/color";

export default function BountyLikeButton({ bountyId }: { bountyId: string }) {
  const queryClient = useQueryClient();
  const activeAccount = useActiveAccount();

  const { data: isLiked } = useQuery({
    queryKey: ["fetchBountyLikeStatus", bountyId, activeAccount?.address],
    queryFn: async () => await getCurrentLikeStatus({ bountyId }),
    enabled: !!activeAccount?.address, // Only fetch if the user is logged in
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const toggleLike = async () => {
    try {
      setIsUpdating(true);
      // Perform the like/dislike mutation
      await handleLikeDislike({
        bountyId,
        like: !isLiked,
      });

      // Invalidate query to sync with server
      queryClient.invalidateQueries({
        queryKey: ["fetchBountyLikeStatus", bountyId, activeAccount?.address],
      });
    } catch (error) {
      console.error("Error updating like status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex gap-2 text-sm text-muted-foreground">
      <Button variant="ghost" size="sm" onClick={toggleLike} disabled={isUpdating}>
        {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        <ThumbsUp fill={isLiked ? filled : empty} className="mr-2 h-4 w-4" />
        Like
      </Button>
    </div>
  );
}
