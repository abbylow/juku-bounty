import { formatDistance } from 'date-fns'
import Link from "next/link"

import { Comment } from '@/actions/comment/type'
import CommentForm from '@/components/comment/form'
import { Badge } from '@/components/ui/badge'
import UserAvatar from '@/components/user/avatar'
import { PROFILE_URL } from '@/const/links'

export function CommentCard(
  { comment, bountyId, bountyCreatorId, contributionId, contributionRefereeId, canComment, isBountyResultDecided }: 
  { comment: Comment, bountyId: string, bountyCreatorId: string, contributionId: number, contributionRefereeId: string, canComment: boolean, isBountyResultDecided: boolean }
) {
  const role = comment?.creator?.id === bountyCreatorId ? "creator" : (comment?.creator?.id === contributionRefereeId ? "referee" : "contributor");
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
              <UserAvatar pfp={comment?.creator?.pfp} />
              <div>
                <p className="text-sm font-medium leading-none">{comment?.creator?.display_name}</p>
                <Link href={`${PROFILE_URL}/${comment?.creator?.username}`}>
                  <p className="text-sm text-muted-foreground">{`@${comment?.creator?.username}`}</p>
                </Link>
              </div>
              <Badge variant="default">{role}</Badge>
            </div>

            <div className="flex gap-3 items-center flex-wrap">
              <div className="text-xs text-muted-foreground">
                {`Created ${formatDistance(comment?.created_at, new Date(), { addSuffix: true })}`}
              </div>
            </div>
          </div>
          <p className="text-sm my-2">{comment?.description}</p>
          {!isBountyResultDecided && canComment && <CommentForm contributionId={contributionId} bountyId={bountyId}/>}
        </div>
      </div>
    </div>
  )
}

