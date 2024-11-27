import { formatDistance } from 'date-fns'
import Link from "next/link"

import { Contribution } from '@/actions/bounty/type'
import CommentForm from '@/components/comment/form'
import { CommentCard } from '@/components/comment/card'
import { Badge } from '@/components/ui/badge'
import UserAvatar from '@/components/user/avatar'
import { PROFILE_URL } from '@/const/links'
import { useViewerContext } from '@/contexts/viewer'

export function ContributionCard({ contribution, bountyCreatorId }: { contribution: Contribution, bountyCreatorId: string }) {
  const { viewer } = useViewerContext();

  const canComment = viewer?.id === contribution?.creator_profile_id || viewer?.id === contribution?.referee_id || viewer?.id === bountyCreatorId;

  return (
    <div className="mb-4 p-4">
      <div className="flex items-start gap-4">
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
          {/* TODO: only show comment button if bounty is not ended */}
          {canComment && <CommentForm contributionId={contribution?.id} bountyId={contribution?.bounty_id}/>}
        </div>
      </div>
      {contribution?.comments && (
        <div className="ml-8 mt-4 border-l-2 pl-4">
          {contribution?.comments?.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              bountyId={contribution?.bounty_id}
              bountyCreatorId={bountyCreatorId}
              contributionId={contribution.id}
              contributionRefereeId={contribution?.referee_id || ""}
              canComment={canComment}
            />
          ))}
        </div>
      )}
    </div>
  )
}

