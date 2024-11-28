import { formatDistance } from 'date-fns'
import { ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link"
import { CheckedState } from '@radix-ui/react-checkbox';
import { useState } from "react";

import { Contribution } from '@/actions/bounty/type'
import CommentForm from '@/components/comment/form'
import { CommentCard } from '@/components/comment/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox';
import UserAvatar from '@/components/user/avatar'
import { PROFILE_URL } from '@/const/links'
import { useViewerContext } from '@/contexts/viewer'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function ContributionCard({
  contribution, bountyCreatorId, isClosingBounty, onSelectWinner, isBountyResultDecided
}: {
  contribution: Contribution, bountyCreatorId: string, isClosingBounty: boolean, onSelectWinner: (id: number, selected: boolean) => void, isBountyResultDecided: boolean
}) {
  const { viewer } = useViewerContext();

  const [showAllComments, setShowAllComments] = useState(false);

  const canComment = viewer?.id === contribution?.creator_profile_id || viewer?.id === contribution?.referee_id || viewer?.id === bountyCreatorId;

  const commentsToShow = showAllComments ? contribution?.comments : contribution?.comments?.slice(0, 1);
  const hasMoreComments = contribution?.comments && contribution?.comments?.length > 1;

  const toggleComments = () => setShowAllComments(!showAllComments);

  const [isSelected, setIsSelected] = useState(false);

  const handleSelect = (checked: CheckedState) => {
    const selected = checked === true;
    setIsSelected(selected);
    if (onSelectWinner) {
      onSelectWinner(contribution.id, selected);
    }
  };

  return (
    <div className={`mb-4 p-4 ${isClosingBounty ? "border border-primary rounded-lg" : ""} ${isSelected ? "bg-gray-100" : ""}`}>
      <div className="flex items-start gap-4">
        {isClosingBounty && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="items-top flex space-x-2">
                  <Checkbox
                    className="mt-1"
                    checked={isSelected}
                    onCheckedChange={handleSelect}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Select this contribution as winner</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {/* for upvote / downvote */}
        {/* <div className="flex flex-col items-center">
          <Button variant="ghost" size="icon">
            <ArrowBigUp className="h-4 w-4" />
          </Button>
          <span className="text-sm font-bold">{'123'}</span>
          <Button variant="ghost" size="icon">
            <ArrowBigDown className="h-4 w-4" />
          </Button>
        </div> */}
        <div className="flex-grow">
          <div className="flex justify-between flex-wrap gap-2">
            <div className="flex items-start space-x-4">
              <UserAvatar pfp={contribution?.creator?.pfp} />
              <div>
                <p className="text-sm font-medium leading-none">{contribution?.creator?.display_name}</p>
                <Link href={`${PROFILE_URL}/${contribution?.creator?.username}`}>
                  <p className="text-sm text-muted-foreground">{`@${contribution?.creator?.username}`}</p>
                </Link>
              </div>
              <Badge variant="secondary">contributor</Badge>
            </div>

            <div className="flex gap-3 items-center flex-wrap">
              <div className="text-xs text-muted-foreground">
                {`Created ${formatDistance(contribution?.created_at, new Date(), { addSuffix: true })}`}
              </div>
            </div>
          </div>
          <p className="text-sm my-2">{contribution?.description}</p>
          {!isBountyResultDecided && canComment && <CommentForm contributionId={contribution?.id} bountyId={contribution?.bounty_id} />}
        </div>
      </div>
      {commentsToShow && commentsToShow.length > 0 && (
        <div className="ml-8 mt-4 border-l-2 pl-4">
          {commentsToShow.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              bountyId={contribution?.bounty_id}
              bountyCreatorId={bountyCreatorId}
              contributionId={contribution.id}
              contributionRefereeId={contribution?.referee_id || ""}
              canComment={canComment}
              isBountyResultDecided={isBountyResultDecided}
            />
          ))}
          {/* Show expand/collapse button if there are more comments */}
          {hasMoreComments && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleComments}
              className="mt-2 text-muted-foreground"
            >
              {showAllComments ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
              {showAllComments ? "Collapse comments" : `Show more comments (${(contribution?.comments?.length || 0) - 1} more)`}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
