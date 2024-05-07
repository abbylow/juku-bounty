"use client"

import Link from "next/link"
import { format, formatDistance, formatDistanceToNow, formatRelative, subDays } from 'date-fns'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { PROFILE_URL } from "@/const/links"
import { Badge } from "../ui/badge"

export default function BountyCard({ details }: { details: any }) {
  console.log({ details })
  console.log(details?.expiry, new Date(details?.expiry))
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
              <div className="text-xs text-muted-foreground">
                {`Due ${formatDistanceToNow(details?.expiry, { addSuffix: true })}`}
              </div>
              {/* TODO: get status from query data */}
              {/* TODO: assign different colors to different statuses */}
              <Badge>Open</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm font-medium">{details?.title}</div>
          {/* TODO: line-clamp-10 and view more */}
          <div className="text-sm text-muted-foreground whitespace-pre-wrap">
            {details?.description}
          </div>

        </CardContent>
      </Card>
    </>
  )
}