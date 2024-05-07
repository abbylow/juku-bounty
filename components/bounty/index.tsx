"use client"

import Link from "next/link"
import { formatDistance, formatDistanceToNow } from 'date-fns'
import { Award, CalendarClock, MessageSquare, ThumbsUp, Share, Lightbulb } from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { PROFILE_URL } from "@/const/links"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export default function BountyCard({ details }: { details: any }) {
  console.log({ details })

  const shareBounty = () => {
    console.log("TODO: share this bounty")
  }

  if (!details || !(details.id)) {
    return <div>Bounty not found!</div>
  }

  return (
    <>
      <Card>
        <CardHeader>
          {/* TODO: replace the url to the author's profile page - currently, this is user's profile */}
          <div className="flex justify-between flex-wrap gap-2">

            <Link href={PROFILE_URL} className="flex items-center space-x-4">
              {/* TODO: replace the avatar to user's pfp */}
              <Avatar>
                <AvatarImage src="/avatars/01.png" />
                <AvatarFallback>OM</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium leading-none">{details?.author?.basicProfile?.displayName || ''}</p>
                <p className="text-sm text-muted-foreground">{`@${details?.author?.basicProfile?.username || ''}`}</p>
              </div>
            </Link>

            <div className="flex gap-3 items-center flex-wrap">
              <div className="text-xs text-muted-foreground">
                {`Created ${formatDistance(details?.created, new Date(), { addSuffix: true })}`}
              </div>
              {/* TODO: get status from query data */}
              {/* TODO: assign different colors to different statuses */}
              <Badge>Open</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm font-medium">{details?.title}</div>
          {/* TODO: line-clamp-10 and view more */}
          <div className="text-sm text-muted-foreground whitespace-pre-wrap">
            {details?.description}
          </div>
          <div className="flex gap-4 flex-wrap">
            <div className="flex gap-2">
              <Award className="h-5 w-5 text-muted-foreground" />
              {/* TODO: math safety check for the calculation below */}
              <p className="text-sm text-muted-foreground">
                {details?.amountPerRewarder * details?.numberOfRewarders} {details?.rewardCurrency?.toUpperCase()}{details?.numberOfRewarders > 1 ? ` for ${details?.numberOfRewarders}` : ""}
              </p>
            </div>
            <div className="flex gap-2">
              <CalendarClock className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {`Due ${formatDistanceToNow(details?.expiry, { addSuffix: true })}`}
              </p>
            </div>
          </div>
          {/* TODO: handle category tags */}
          <div className="flex gap-2">
            <Badge variant="outline">DeFi</Badge>
            <Badge variant="outline">Web3</Badge>
          </div>
          <Separator />
        </CardContent>
        <CardFooter>
          <div className="w-full flex justify-between items-center">
            {/* TODO: handle reactions */}
            <div className="flex gap-3">
              <Button variant="ghost" size="icon">
                <ThumbsUp className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <MessageSquare className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Lightbulb className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={shareBounty}>
                <Share className="h-5 w-5" />
              </Button>
            </div>
            {/* TODO: handle dynamic CTA */}
            <div className="">
              <Button>
                <Lightbulb className="mr-2 h-5 w-5" /> Contribute
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </>
  )
}