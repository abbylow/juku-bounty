import { formatDistance } from 'date-fns'
import { MessageSquare } from 'lucide-react'
import Link from "next/link"

import { Contribution } from '@/actions/bounty/type'
import { Badge } from '@/components/ui/badge'
import { Button } from "@/components/ui/button"
import UserAvatar from '@/components/user/avatar'
import { PROFILE_URL } from '@/const/links'
import { useViewerContext } from '@/contexts/viewer'

export function ContributionCard({ contribution, bountyCreatorId }: { contribution: Contribution, bountyCreatorId: string }) {
  const { viewer } = useViewerContext();
  
  const canComment = viewer?.id === contribution?.creator_profile_id || viewer?.id === contribution?.referree_id || viewer?.id === bountyCreatorId;

  function commentOnContribution(event: React.MouseEvent<HTMLButtonElement>): void {
    console.log("Comment todo")
  }

  return (
    <div className="mb-4 p-4">
      <div className="flex items-start gap-4">
        {/* TODO: add upvote / downvote */}
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
              <Badge variant="secondary">{contribution?.referree_id ? "referrer" : "contributor"}</Badge>
            </div>

            <div className="flex gap-3 items-center flex-wrap">
              <div className="text-xs text-muted-foreground">
                {`Created ${formatDistance(contribution?.created_at, new Date(), { addSuffix: true })}`}
              </div>
            </div>
          </div>
          <p className="text-sm my-2">{contribution?.description}</p>
          {/* TODO: only show comment button if bounty is not ended */}
          {canComment && <div className="flex gap-2 text-sm text-muted-foreground">
            <Button variant="ghost" size="sm" onClick={commentOnContribution}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Comment
            </Button>
          </div>}
        </div>
      </div>
      {/* {comments.length > 0 && (
        <div className="ml-8 mt-4 border-l-2 pl-4">
          {comments.map((reply, index) => (
            <Contribution key={index} {...reply} />
          ))}
        </div>
      )} */}
    </div>
  )
}

