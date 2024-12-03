"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ThumbsUp } from "lucide-react";
import { useEffect, useOptimistic, useTransition } from "react";
import { useActiveAccount } from "thirdweb/react";

import { handleLikeDislike } from "@/actions/bountyLike/likeBounty";
import { getCurrentLikeStatus } from "@/actions/bountyLike/getBountyLike";
import { Button } from "@/components/ui/button";
import { empty, filled } from "@/const/color";

export default function BountyLikeButton({ bountyId }: { bountyId: string }) {
  const queryClient = useQueryClient();
  const activeAccount = useActiveAccount();

  const [isPending, startTransition] = useTransition();

  const { data: isLiked = false } = useQuery({
    queryKey: ["fetchBountyLikeStatus", bountyId, activeAccount?.address],
    queryFn: async () => await getCurrentLikeStatus({ bountyId }),
    enabled: !!activeAccount?.address, // Only fetch if the user is logged in
    initialData: false, // Default to false if no data is available
  });

  // Optimistic State
  const [optimisticLikeStatus, addOptimisticLikeStatus] = useOptimistic<boolean, boolean>(
    isLiked,
    (currentState: boolean, newState: boolean) => newState // Replace the current state with the new state
  );

  // Sync optimistic state with the query result
  useEffect(() => {
    if (isLiked !== optimisticLikeStatus) {
      startTransition(() => {
        addOptimisticLikeStatus(isLiked); // Sync the optimistic state with the latest `isLiked`
      });
    }
  }, [addOptimisticLikeStatus, optimisticLikeStatus, isLiked]);

  const toggleLike = async () => {
    // Update UI optimistically
    startTransition(() => {
      addOptimisticLikeStatus(!optimisticLikeStatus);
    });

    try {
      // Perform the like/dislike mutation
      await handleLikeDislike({
        bountyId,
        like: !optimisticLikeStatus,
      });

      // Invalidate query to sync with server
      queryClient.invalidateQueries({
        queryKey: ["fetchBountyLikeStatus", bountyId, activeAccount?.address],
      });
    } catch (error) {
      console.error("Error updating like status:", error);

      // Rollback optimistic update if mutation fails
      startTransition(() => {
        addOptimisticLikeStatus(optimisticLikeStatus);
      });
    }
  };

  return (
    <div className="flex gap-2 text-sm text-muted-foreground">
      <Button variant="ghost" size="sm" onClick={toggleLike}>
        <ThumbsUp fill={optimisticLikeStatus ? filled : empty} className="mr-2 h-4 w-4" />
        Like
      </Button>
    </div>
  );
}
