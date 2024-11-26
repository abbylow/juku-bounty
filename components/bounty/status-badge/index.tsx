"use client"

import { useEffect, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { BountyStatus } from "@/const/bounty-status"

export default function BountyStatusBadge({ details, bountyData }: { details: any, bountyData: any }) {
  const [status, setStatus] = useState<BountyStatus>(BountyStatus.UNKNOWN);

  useEffect(() => {
    if (details && bountyData) {
      const isClosed = bountyData[7]; // hardcoded index for isClosed
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

  return (
    <Badge variant="outline">{status}</Badge>
  )
}