"use client"

import { useEffect, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { BountyStatus } from "@/const/bounty-status"

export default function BountyStatusBadge({ details }: { details: any }) {
  const [status, setStatus] = useState<BountyStatus>(BountyStatus.UNKNOWN);

  useEffect(() => {
    if (details.id) {
      const isClosed = details.is_result_decided; // hardcoded index for isClosed
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
  }, [details.is_result_decided, details.expiry, details.winningContributions, details.id])

  return (
    <Badge variant="outline">{status}</Badge>
  )
}